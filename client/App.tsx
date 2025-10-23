import React from 'react'

// ВРЕМЕННО: без роутера и без запросов к /server
export default function App() {
  React.useEffect(() => {
    console.log('MAKEUP_NK: App mounted')
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>✅ Сайт работает</h1>
      <p>Это тестовый рендер без роутера и без сервера.</p>
    </div>
  )
}
