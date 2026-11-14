
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Discord Dashboard</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <aside class="servers">
    <div class="server active">D</div>
    <div class="server">G</div>
    <div class="server">M</div>
    <div class="server add">+</div>
  </aside>

  <aside class="sidebar">
    <h3>Discord Dashboard</h3>
    <p class="category">TEXT CHANNELS</p>
    <div class="channel active"># general</div>
    <div class="channel"># announcements</div>
    <div class="channel"># gaming</div>
    <div class="channel"># chat</div>
    <div class="user">
      <div class="avatar">D</div>
      <div>
        <b>Demo User</b>
        <small>Dashboard preview</small>
      </div>
    </div>
  </aside>

  <main>
    <header id="channel-title"># general</header>
    <section id="messages">
      <div class="welcome">
        <h1>Welcome!</h1>
        <p>This is your Discord dashboard.</p>
        <p>Choose a channel to get started.</p>
      </div>
    </section>
    <form id="message-form">
      <input id="message" placeholder="Message #general..." autocomplete="off">
      <button type="submit">Send</button>
    </form>
  </main>
  <script src="/app.js"></script>
</body>
</html>
