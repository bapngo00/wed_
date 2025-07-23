let loggedInUser = null;
let currentChatUser = null;

// 1️⃣ Lấy user đăng nhập
const stored = localStorage.getItem('user');
if (!stored) {
  alert('Bạn cần đăng nhập!');
  window.location.href = 'index.html';
} else {
  loggedInUser = JSON.parse(stored);
}

// 2️⃣ Load danh sách người dùng (trừ chính mình)
fetch('https://6876662f814c0dfa653bf2e8.mockapi.io/taikhoan')
  .then(res => res.json())
  .then(users => {
    const list = document.getElementById("messengerList");
    list.innerHTML = '';
    users.forEach(user => {
      if (user.id === loggedInUser.id) return; // bỏ qua mình

      const a = document.createElement("a");
      a.className = "dropdown-item d-flex align-items-center gap-2";
      a.dataset.id = user.id;

      const img = document.createElement("img");
      img.src = user.avatar;
      img.width = img.height = 32;
      img.style.borderRadius = "50%";

      const span = document.createElement("span");
      span.textContent = user.username;

      a.append(img, span);
      list.appendChild(a);

      a.addEventListener('click', () => selectChatWith(user.id));
    });
  });

// 3️⃣ Khi chọn chat với ai đó
function selectChatWith(userId) {
  fetch(`https://6876662f814c0dfa653bf2e8.mockapi.io/taikhoan/${userId}`)
    .then(res => res.json())
    .then(user => {
      currentChatUser = user;
      document.getElementById('chatBox').innerHTML = '';
      document.getElementById('messageForm').classList.remove('d-none');
      loadConversation();
    });
}

// 4️⃣ Load toàn bộ tin nhắn giữa bạn và target
function loadConversation() {
  const chatBox = document.getElementById('chatBox');
  chatBox.innerHTML = '';

  // Lấy tin nhắn của cả 2 bên
  Promise.all([
    fetch(`https://6876662f814c0dfa653bf2e8.mockapi.io/taikhoan/${loggedInUser.id}`).then(res => res.json()),
    fetch(`https://6876662f814c0dfa653bf2e8.mockapi.io/taikhoan/${currentChatUser.id}`).then(res => res.json())
  ])
    .then(([myData, otherData]) => {
      const messages = [...(myData.messages || []), ...(otherData.messages || [])];

      // Lọc tin nhắn giữa hai người
      const filtered = messages.filter(msg =>
        (msg.fromId === loggedInUser.id && msg.toId === currentChatUser.id) ||
        (msg.fromId === currentChatUser.id && msg.toId === loggedInUser.id)
      );

      // Sắp xếp theo thời gian
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      filtered.forEach(msg => {
        const isMe = msg.fromId === loggedInUser.id;

        const wrapper = document.createElement('div');
        wrapper.className = `d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-2 flex-column align-items-${isMe ? 'end' : 'start'}`;

        if (!isMe) {
          const avatar = document.createElement('img');
          avatar.src = currentChatUser.avatar;
          avatar.width = avatar.height = 32;
          avatar.style.borderRadius = '50%';
          avatar.style.marginBottom = '4px';
          wrapper.appendChild(avatar);
        }

        const nameTag = document.createElement('div');
        nameTag.className = 'small text-muted mb-1';
        nameTag.textContent = isMe ? 'Bạn' : currentChatUser.username;
        wrapper.appendChild(nameTag);

        const msgDiv = document.createElement('div');
        msgDiv.className = `p-2 rounded ${isMe ? 'bg-primary text-white text-end' : 'bg-light text-start'}`;
        msgDiv.style.maxWidth = '75%';
        msgDiv.textContent = msg.text;
        wrapper.appendChild(msgDiv);
        chatBox.appendChild(wrapper);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

document.getElementById('messageForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!currentChatUser) return;

  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;

  const newMessage = {
    fromId: loggedInUser.id,
    toId: currentChatUser.id,
    text,
    createdAt: new Date().toISOString()
  };

  // Thêm message vào mảng và cập nhật user
  const updated = {
    ...currentChatUser,
    messages: [...(currentChatUser.messages || []), newMessage]
  };

  fetch(`https://6876662f814c0dfa653bf2e8.mockapi.io/taikhoan/${currentChatUser.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  })
    .then(res => res.json())
    .then(savedUser => {
      currentChatUser = savedUser;
      input.value = '';
      loadConversation();
    })
    .catch(console.error);
});
