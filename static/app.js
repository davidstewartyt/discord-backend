
const form = document.querySelector("#message-form");
const input = document.querySelector("#message");
const messages = document.querySelector("#messages");
const channels = document.querySelectorAll(".channel");
const title = document.querySelector("#channel-title");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  const message = document.createElement("p");
  message.textContent = "Demo User: " + value;

  messages.appendChild(message);
  input.value = "";
  messages.scrollTop = messages.scrollHeight;
});

channels.forEach(channel => {
  channel.addEventListener("click", () => {
    channels.forEach(c => c.classList.remove("active"));
    channel.classList.add("active");

    title.textContent = channel.textContent.trim();
    messages.innerHTML = `
      <div class="welcome">
        <h1>${channel.textContent.trim()}</h1>
        <p>Welcome to this channel.</p>
      </div>
    `;
  });
});
