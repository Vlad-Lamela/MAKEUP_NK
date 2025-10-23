import React from 'react'

export default function App() {
  React.useEffect(() => {
    console.log('MAKEUP_NK: App mounted')
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', color: '#111' }}>
      <h1>✅ Сайт работает</h1>
      <p>Тестовый рендер. Если ты видишь этот текст — бандл исполняется.</p>
    </div>
  )
}
