import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    // Note: We do NOT exchange the code on the server here.
    // In an iframe environment, exchanging it on the server (which is in a popup)
    // sets the cookies in the unpartitioned jar, hiding them from the iframe.
    // Instead, we pass the URL back to the iframe so the iframe can exchange it
    // and write cookies to its partitioned jar.
    return new NextResponse(`
      <html>
        <head>
          <title>Tasdiqlash...</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f9fafb; }
            .box { text-align: center; padding: 30px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Muvaffaqiyatli!</h2>
            <p>Tizimga kirish yakunlandi. Agar bu oyna yopilmasa, uni o'zingiz yopishingiz mumkin.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_CODE_RECEIVED', url: window.location.href }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // fallback if error
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
