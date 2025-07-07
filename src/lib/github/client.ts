import { Octokit } from '@octokit/rest';
import type { GitHubRepository, GitHubRateLimit } from '@/types/github';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class GitHubClient {
  private octokit: Octokit;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ 
      auth: accessToken,
      retry: {
        doNotRetry: ['4xx'], // Don't retry client errors
      },
    });
  }

  /**
   * Get user's repositories
   */
  async getRepositories(): Promise<GitHubRepository[]> {
    try {
      await this.checkRateLimit();
      
      const { data, headers } = await this.octokit.rest.repos.listForAuthenticatedUser({
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      });

      this.updateRateLimit(headers);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Save reflection to GitHub repository
   */
  async saveReflection(
    content: string,
    fileName: string,
    repoPath: string
  ): Promise<void> {
    try {
      await this.checkRateLimit();
      
      const [owner, repo] = repoPath.split('/');
      const path = `reflections/${fileName}`;
      
      // Check if file already exists
      let sha: string | undefined;
      try {
        const { data: existingFile } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
        });
        
        if ('sha' in existingFile) {
          sha = existingFile.sha;
        }
      } catch (error: any) {
        // File doesn't exist, which is fine
        if (error.status !== 404) {
          throw error;
        }
      }

      // Create or update file
      const { data, headers } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Add reflection: ${fileName}`,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      });

      this.updateRateLimit(headers);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check repository permissions
   */
  async checkRepositoryPermissions(repoPath: string): Promise<boolean> {
    try {
      await this.checkRateLimit();
      
      const [owner, repo] = repoPath.split('/');
      const { data, headers } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      this.updateRateLimit(headers);
      return data.permissions?.push || false;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get reflection files from repository
   */
  async getReflectionFiles(repoPath: string): Promise<Array<{
    name: string;
    path: string;
    sha: string;
    size: number;
    download_url: string;
  }>> {
    try {
      await this.checkRateLimit();
      
      const [owner, repo] = repoPath.split('/');
      const { data, headers } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'reflections',
      });

      this.updateRateLimit(headers);
      
      if (Array.isArray(data)) {
        // Filter for .md files only
        return data
          .filter(file => file.type === 'file' && file.name.endsWith('.md'))
          .map(file => ({
            name: file.name,
            path: file.path,
            sha: file.sha,
            size: file.size,
            download_url: file.download_url || '',
          }))
          .sort((a, b) => b.name.localeCompare(a.name)); // Sort by name descending (newest first)
      }
      
      return [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific reflection file content
   */
  async getReflectionFile(repoPath: string, fileName: string): Promise<string> {
    try {
      await this.checkRateLimit();
      
      const [owner, repo] = repoPath.split('/');
      const path = `reflections/${fileName}`;
      
      const { data, headers } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      this.updateRateLimit(headers);
      
      if ('content' in data && data.content) {
        // Decode base64 content - remove newlines first
        const base64Content = data.content.replace(/\n/g, '');
        try {
          // Modern approach to decode UTF-8 from base64
          const binaryString = atob(base64Content);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new TextDecoder('utf-8').decode(bytes);
        } catch (decodeError) {
          console.error('Failed to decode file content:', decodeError);
          // Fallback to simple atob
          return atob(base64Content);
        }
      }
      
      throw new GitHubApiError('File content not found', 404);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(): Promise<GitHubRateLimit> {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      this.rateLimitRemaining = data.rate.remaining;
      this.rateLimitReset = data.rate.reset;
      return data.rate;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check rate limit before making requests
   */
  private async checkRateLimit(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    
    if (this.rateLimitRemaining <= 10 && now < this.rateLimitReset) {
      const waitTime = (this.rateLimitReset - now) * 1000;
      throw new GitHubApiError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        429
      );
    }
  }

  /**
   * Update rate limit counters from response headers
   */
  private updateRateLimit(headers: any): void {
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    if (reset) {
      this.rateLimitReset = parseInt(reset, 10);
    }
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): GitHubApiError {
    if (error instanceof GitHubApiError) {
      return error;
    }

    const status = error.status || 500;
    let message = error.message || 'Unknown GitHub API error';

    // Handle specific error types
    switch (status) {
      case 401:
        message = 'GitHub authentication failed. Please reconnect your account.';
        break;
      case 403:
        if (error.message?.includes('rate limit')) {
          message = 'GitHub API rate limit exceeded. Please wait before trying again.';
        } else {
          message = 'Access denied. Please check repository permissions.';
        }
        break;
      case 404:
        message = 'Repository or file not found.';
        break;
      case 422:
        message = 'Invalid request data. Please check your input.';
        break;
      default:
        message = `GitHub API error: ${message}`;
    }

    return new GitHubApiError(message, status, error.response);
  }
}

/**
 * Create GitHub client instance
 */
export const createGitHubClient = (accessToken: string): GitHubClient => {
  return new GitHubClient(accessToken);
};