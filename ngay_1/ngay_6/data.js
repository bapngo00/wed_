fetch('https://6876662f814c0dfa653bf2e8.mockapi.io/users')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("messengerList");
    list.innerHTML = "";

    data.forEach(user => {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.className = "dropdown-item d-flex align-items-center gap-2";

      const img = document.createElement("img");
      img.src = user.avatar;
      img.alt = user.name;
      img.width = 32;
      img.height = 32;
      img.style.borderRadius = "50%";

      const span = document.createElement("span");
      span.textContent = user.name;

      // Khi click vào người dùng, hiển thị tin nhắn
      a.addEventListener("click", () => {
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = "";

        if (user.messages && user.messages.length > 0) {
          user.messages.forEach(msg => {
            const p = document.createElement("p");
            p.innerHTML = `<strong>${msg.from}:</strong> ${msg.text}`;
            chatBox.appendChild(p);
          });
        } else {
          chatBox.innerHTML = "<em>Không có tin nhắn nào.</em>";
        }
      });

      a.appendChild(img);
      a.appendChild(span);
      li.appendChild(a);
      list.appendChild(li);
    });
  })
  .catch(err => {
    console.error("Lỗi khi tải dữ liệu:", err);
  });
