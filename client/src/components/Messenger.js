import { Socket } from ".."

export const OpenMessengers = [];
export class Messenger {
  constructor(currentUserId, userToId, username, imageUrl, RootElement){
    this.currentUserId = currentUserId;
    this.userToId = userToId;
    this.username = username;
    this.imageUrl = imageUrl;
    this.RootElement = RootElement;
    this.chatBody = document.createElement("div");
    this.messenger = document.createElement("div")
    this.messages = new ObservableArray([
      {
        text: "Hey there! Have you delved into the Cyberpunk universe lately?",
        class: "left",
      },
      {
        text: "Absolutely! Night City is as chaotic as ever. The neon lights, the tech, it's all so immersive.",
        class: "right",
      },
      {
        text: "I know, right? The cityscape is mind-blowing. Did you explore the Badlands yet?",
        class: "left",
      },
      {
        text: "Just started roaming there. The wasteland vibes and the Nomad life are a whole new experience.",
        class: "right",
      },
      {
        text: "Nice! Nomad path adds such a different perspective. What's your go-to cyberware setup?",
        class: "left",
      },
      {
        text: "I'm all about the mantis blades and the projectile launch system. Makes every encounter intense. You?",
        class: "right",
      },
      {
        text: "Smart choice! I'm a netrunner at heart. Hacking into systems and manipulating the environment is my thing.",
        class: "left",
      },
      {
        text: "Oh, the hacking aspect is so intricate. Have you uncovered any hidden gems or Easter eggs in the game?",
        class: "right",
      },
      {
        text: "Found a few! There's this hidden bar with an NPC telling crazy stories about the old net. It's a goldmine.",
        class: "left",
      },
      {
        text: "Nice find! The attention to detail is insane. And the soundtrack? Pure cyberpunk vibes. Favorite track?",
        class: "right",
      },
      {
        text: "Gotta be 'Chippin' In' by Samurai. Takes me back to those Keanu Reeves moments. You?",
        class: "left",
      },
      {
        text: "'Never Fade Away' by Kerry Eurodyne. The emotions it evokes during key moments are unparalleled.",
        class: "right",
      },
      {
        text: "True, the narrative is gripping. Speaking of which, which lifepath did you choose for your V?",
        class: "left",
      },
      {
        text: "Street Kid. I love the street-smart attitude. You get to navigate the underbelly of Night City.",
        class: "right",
      },
      {
        text: "Nice. I went with Nomad for that nomadic freedom. Different paths, but both lead to a wild Cyberpunk journey!",
        class: "left",
      },
    ])
    this.messages.addListener((eventName, items, array) => {
      console.log("ITEM ADDED!", items)
    })
    OpenMessengers.push(this)

    this.chatBody.addEventListener('wheel', Throttle(() => this.LoadOlderChats(), 300));
  }

  //Get messages from the back-end

  Close(){
    this.RootElement.removeChild(this.messenger);
    OpenMessengers.pop(this.messenger);
  }

  LoadChats(){
    //Initalize last messages from database (like 20 last messages)
  }

  LoadOlderChats(){
  // If scollred up, add more messagesconst isScrollCloseToBottom = () => {
    const isAtTop = this.chatBody.scrollTop <= 800;
    if (isAtTop){
      for(let i = 0; i <= 20; i++)
      this.AppendLine({text: "JUST A TESTING: " + i, class: "left"}, true)
    }
  }

  Create(){
    this.messenger.classList.add("messenger")
    
    const chatHeader = document.createElement("div")
    chatHeader.classList.add("chat-header")
    
    const userChatInfo = document.createElement("div")
    userChatInfo.classList.add("user-chat-info")
    
    const userImage = document.createElement("img")
    userImage.src = this.imageUrl
    userImage.alt = this.userToId

    const userName = document.createElement("p")
    userName.textContent = this.username
    const closeIcon = document.createElement("img")
    closeIcon.src = "/assets/close.svg"
    closeIcon.alt = "close"
    closeIcon.addEventListener("click", () => {
      this.Close()
    })
    
    userChatInfo.appendChild(userImage)
    userChatInfo.appendChild(userName)
    
    chatHeader.appendChild(userChatInfo)
    chatHeader.appendChild(closeIcon)
    
    this.chatBody.classList.add("chat-body")


    this.AddChats()


    const chatFooter = document.createElement("div");
    chatFooter.className = "chat-footer";
  
  // Create form for message input
    const messageForm = document.createElement("form");
  
  
  // Create message input
    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.placeholder = "Aa";
    messageInput.id = "message";
  
  // Create send button
    const sendButton = document.createElement("input");
    sendButton.type = "image";
    sendButton.src = "/assets/send.svg";
    sendButton.name = "submit";
    sendButton.alt = "submit";
    sendButton.className = "form-img-submit";
    sendButton.addEventListener('click', (event) => {
      event.preventDefault()
      let messageToSend = {
        "message": messageInput.value,
        "to_user": this.userToId,
      }
      sendMessage(JSON.stringify(messageToSend))
      let textLine = {
        text: messageInput.value,
        class: "right",
      }
      this.messages.push(textLine)
      messageInput.value = "";
      this.AppendLine(textLine)
    })
  
    messageForm.appendChild(messageInput);
    messageForm.appendChild(sendButton);
  
    chatFooter.appendChild(messageForm);
  
    this.messenger.appendChild(chatHeader)
    this.messenger.appendChild(this.chatBody)
    this.messenger.appendChild(chatFooter)
    //appendToRoot
    this.RootElement.appendChild(this.messenger)
    //move the chat to bottom
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  AddChats(){
    // const scrollTop = this.chatBody.scrollTop;
    this.chatBody.innerHTML = "";
    this.messages.array.forEach((message) => {
      this.AppendLine(message)
    })
  }
  
  AppendLine(message, top=false){
    const msgDiv = document.createElement("div")
    msgDiv.classList.add("msg")
    
    const msgText = document.createElement("p")
    msgText.classList.add(message.class)
    msgText.textContent = message.text
    
    msgDiv.appendChild(msgText)

    if(top){
      this.chatBody.insertBefore(msgDiv, this.chatBody.firstChild);
    }else{
      this.chatBody.appendChild(msgDiv)
      this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }
    // return msgDiv
  }
}

export function Throttle(func, delay){
  let shouldWait = false;

  return function(...args){
      if(shouldWait) return;
      func(...args);
      shouldWait = true;

      setTimeout(() => {
          shouldWait = false;
      }, delay)
  }
}


class ObservableArray {
  constructor(arr) {
    this.array = arr;
    this.listeners = [];
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  push(item) {
    this.array.push(item);
    this.notifyListeners('add', [item]);
  }

  // Add other array methods as needed

  notifyListeners(eventName, items) {
    this.listeners.forEach(listener => {
      listener(eventName, items, this.array);
    });
  }
}
// Append the 'messenger' element to the document or any other container element in your HTML
function sendMessage(message) {
  if (Socket.readyState === WebSocket.OPEN) {
    Socket.send(message);
    // console.log('Message sent:', message);
  } else {
    console.error('WebSocket connection not open. Cannot send message.');
  }
}

