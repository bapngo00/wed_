let currentUser = null;

fetch('https://6876662f814c0dfa653bf2e8.mockapi.io/users')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("messengerList");
    list.innerHTML = "";

    data.forEach(user => {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.className = "dropdown-item d-flex align-items-center gap-2";
      a.dataset.id = user.id;

      const img = document.createElement("img");
      img.src = user.avatar;
      img.alt = user.name;
      img.width = 32;
      img.height = 32;
      img.style.borderRadius = "50%";

      const span = document.createElement("span");
      span.textContent = user.name;

      a.appendChild(img);
      a.appendChild(span);
      li.appendChild(a);
      list.appendChild(li);

      // Khi click vào người dùng
      a.addEventListener("click", () => {
        currentUser = user;

        const chatBox = document.getElementById("chatBox");
        const messageForm = document.getElementById("messageForm");
        const messageInput = document.getElementById("messageInput");

        chatBox.innerHTML = "";
        messageForm.classList.remove("d-none");

        if (user.messages && user.messages.length > 0) {
          user.messages.forEach(msg => {
            const isUser = msg.from === "Bạn";

            const wrapper = document.createElement("div");
            wrapper.className = `d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-2 flex-column align-items-${isUser ? 'end' : 'start'}`;

            // Nếu không phải "Bạn" thì thêm avatar người gửi
            if (!isUser) {
              const avatar = document.createElement("img");
              avatar.src = user.avatar;
              avatar.alt = msg.from;
              avatar.width = 32;
              avatar.height = 32;
              avatar.style.borderRadius = "50%";
              avatar.style.objectFit = "cover";
              avatar.style.marginBottom = "4px";
              wrapper.appendChild(avatar);
            }

            // Hiển thị tên người gửi
            const nameTag = document.createElement("div");
            nameTag.className = "small text-muted mb-1";
            nameTag.textContent = msg.from;
            wrapper.appendChild(nameTag);

            // Tin nhắn
            const msgDiv = document.createElement("div");
            msgDiv.className = `p-2 rounded ${isUser ? 'bg-primary text-white text-end' : 'bg-light text-start'}`;
            msgDiv.style.maxWidth = "75%";
            msgDiv.innerHTML = `${msg.text}`;

            wrapper.appendChild(msgDiv);
            chatBox.appendChild(wrapper);
          });
        } else {
          chatBox.innerHTML = "<em>Không có tin nhắn nào.</em>";
        }

        chatBox.scrollTop = chatBox.scrollHeight;
      });
    });
  })
  .catch(err => {
    console.error("Lỗi khi tải dữ liệu:", err);
  });


// Gửi tin nhắn
document.getElementById("messageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !currentUser) return;

  const newMessage = { from: "Bạn", text };

  // Gửi PUT để cập nhật
  fetch(`https://6876662f814c0dfa653bf2e8.mockapi.io/users/${currentUser.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...currentUser,
      messages: [...(currentUser.messages || []), newMessage]
    })
  })
    .then(res => res.json())
    .then(updatedUser => {
      currentUser = updatedUser;
      input.value = "";
      input.focus();

      // 👉 Thêm tin nhắn mới vào giao diện
      const chatBox = document.getElementById("chatBox");

      const wrapper = document.createElement("div");
      wrapper.className = "d-flex justify-content-end mb-2 flex-column align-items-end";

      const nameTag = document.createElement("div");
      nameTag.className = "small text-muted mb-1";
      nameTag.textContent = "Bạn";
      wrapper.appendChild(nameTag);

      const msgDiv = document.createElement("div");
      msgDiv.className = "p-2 rounded bg-primary text-white text-end";
      msgDiv.style.maxWidth = "75%";
      msgDiv.innerHTML = `${newMessage.text}`;

      wrapper.appendChild(msgDiv);
      chatBox.appendChild(wrapper);

      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(err => console.error("Lỗi gửi tin nhắn:", err));
});
