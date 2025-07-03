export const metadata = {
  title: '振り返り作成 | Reflect Hub',
  description: 'GitHub連携振り返りサービス - 振り返りを作成してワンクリックで保存'
}

export default function ReflectionPage() {
  return (
    <div className="notion-editor">
      <div className="notion-page">
        <div className="notion-block">
          <h1 className="notion-h1 mb-8">振り返り作成</h1>
        </div>
        
        <div className="notion-block">
          <p className="notion-text text-muted-foreground mb-6">
            今日の振り返りを書いて、ワンクリックでGitHubに保存しましょう。
          </p>
        </div>
        
        {/* TODO: ReflectionEditorコンポーネントを追加 */}
        <div className="border rounded-lg p-6 bg-card">
          <p className="text-muted-foreground">
            エディターコンポーネントをここに実装予定
          </p>
        </div>
      </div>
    </div>
  )
}