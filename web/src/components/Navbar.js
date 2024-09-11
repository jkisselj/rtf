import "../styles/navbar.css"

import plusSvg from "../assets/img/plus.svg"
import avatar from "../assets/img/avatar.svg.png"
import arrowSvg from "../assets/img/arrow.svg"
import modalProfile from "../assets/img/modalProfile.svg"
import notificationButtonImage from "../assets/img/notifications.svg"
import logout from "../assets/img/logout.svg"
import { router } from "../router/Router"
import {GetUserInfo, isLoggedIn, Logout} from "../helpers/ServerRequests"
import {ROOT} from "../index";
import { ShowNotificationsModal } from "../helpers/Notifications"


document.addEventListener("click", async (e) => {
  const target = e.target

  // Check if the clicked element is an anchor element and has the same origin
  if (target.tagName === "A" && target.origin === location.origin) {
    e.preventDefault() // Prevent the default behavior of anchor links


    window.history.pushState({}, "", e.target.href)

    // Call RouterFunction asynchronously
    await router()
  }
})


export async function Navbar() {
  const userId = await isLoggedIn()
  const userInfo = await GetUserInfo(userId)


  const navbarHTML = await RenderNavbar(userInfo);

  ROOT.appendChild(navbarHTML)

  const userProfile = document.querySelector(".userprofile-modal")
  const userBlock = document.querySelector(".user-profile")
  userBlock.addEventListener("click", displayUserModal)
  const modalArrow = document.querySelector(".modal-arrow")

  function displayUserModal() {
    userProfile.classList.toggle("showModal")
    modalArrow.classList.toggle("show-modal-arrow")
  }

  const UserprofileLink = document.querySelector(".UserprofileLink")
  if (UserprofileLink) {
    UserprofileLink.addEventListener("click", () => {
      window.history.pushState({}, "", "/profile")
      router()
    })
  }

  const logoutBtn = document.querySelector(".logoutBtn")
  logoutBtn.addEventListener("click", () => {
    Logout()


    window.history.pushState({}, "", "/login")
    router()
  })

  const notificationButton = document.querySelector(".notification-button")
  notificationButton.addEventListener("click", () => {

  const  notificationCounter = document.querySelector(".notification-counter")
     notificationCounter.textContent = 0
     notificationCounter.classList.remove("show-notification-counter")
    ShowNotificationsModal()
  })

  const Logo = document.querySelector(".navbar-logo")

  Logo.addEventListener("click", ()=>{

    window.history.pushState({}, "", "/")
    router()

  })

  const CreatePost = document.querySelector(".create-post")

  CreatePost.addEventListener("click", ()=>{


    window.history.pushState({}, "", "/create-post")
    router()

  })
  return navbarHTML;
}


const RenderNavbar = async (user) =>{
  user = user.data
  const currentUrl = window.location.href
  const navbar = document.createElement("nav");
  navbar.className = "navbar-post";
  // Create nav-start
  const navStart = document.createElement("div");
  navStart.className = "nav-start";
  // Create logo link
  const logoLink = document.createElement("div");
  // logoLink.href = "/";
  logoLink.className = "navbar-logo"
  const logo = document.createElement("h1");
  logo.className = "logo";
  logo.textContent = "ASK RABBIT";
  logoLink.appendChild(logo);
  navStart.appendChild(logoLink);

  // Create user block
  const userBlock = document.createElement("div");
  userBlock.className = "user-block";

  // Create message button
  // const messageButton = document.createElement("div");
  // messageButton.className = "message-button";
  // const messageButtonImg = document.createElement("img");
  // messageButtonImg.src = messageButtonImage;
  // messageButtonImg.alt = "message-button";
  // messageButton.appendChild(messageButtonImg);

//Create notification button
const notificationButton = document.createElement("div");
notificationButton.className = "notification-button";
const notificationButtonImg = document.createElement("img");
notificationButtonImg.src = notificationButtonImage;
notificationButtonImg.alt = "notification-button";
notificationButton.appendChild(notificationButtonImg);


//nofification counter
const notificationCounter = document.createElement("div");
notificationCounter.className = "notification-counter";
notificationCounter.textContent = 0;
notificationButton.appendChild(notificationCounter);

//create notifications modal
const notificationsModal = document.createElement("div");
notificationsModal.className = "notifications-modal";

notificationButton.appendChild(notificationsModal);


// CREATE POST BUTTON //
  const createPostLink = document.createElement("div");
  createPostLink.className = "create-post";
  const createPostButton = document.createElement("div");
  createPostButton.className = "create-post-button";
  const createPostImg = document.createElement("img");
  createPostImg.src = plusSvg;
  createPostImg.alt = "create-post-button";
  createPostButton.appendChild(createPostImg);
//
  if (!currentUrl.includes("create-post")) {
    createPostLink.appendChild(createPostButton);
  }
///

  // Create user profile
  const userProfile = document.createElement("div");
  userProfile.className = "user-profile";

  // Create user avatar
  const userAvatar = document.createElement("img");
  userAvatar.className = "user-avatar";
  userAvatar.src = avatar;
  userAvatar.alt = "profile";

  // Create user profile selector
  const userSelector = document.createElement("div");
  userSelector.className = "user-profile-selector";
  const username = document.createElement("p");
  username.classList.add("username");
  username.textContent = user.username;

  // Create modal arrow
  const modalArrow = document.createElement("img");
  modalArrow.className = "modal-arrow";
  modalArrow.src = arrowSvg;
  modalArrow.alt = "arrow";

  // Create user profile modal
  const userProfileModal = document.createElement("div");
  userProfileModal.className = "userprofile-modal";

  // Create modal div for My Profile
  const modalDivMyProfile = document.createElement("div");
  modalDivMyProfile.className = "modal-div";
  const userProfileLink = document.createElement("p");
  userProfileLink.className = "UserprofileLink";
  userProfileLink.textContent = "My profile";
  const modalIconMyProfile = document.createElement("img");
  modalIconMyProfile.src = modalProfile;
  modalIconMyProfile.className = "modal-icon";
  modalIconMyProfile.alt = "profile";
  modalDivMyProfile.appendChild(userProfileLink);
  modalDivMyProfile.appendChild(modalIconMyProfile);

  // Create modal div for Log Out
  const modalDivLogOut = document.createElement("div");
  modalDivLogOut.className = "modal-div";
  const logoutBtn = document.createElement("p");
  logoutBtn.className = "logoutBtn";
  logoutBtn.textContent = "Log out";
  const modalIconLogOut = document.createElement("img");
  modalIconLogOut.src = logout;
  modalIconLogOut.className = "modal-icon";
  modalIconLogOut.alt = "logout";
  modalDivLogOut.appendChild(logoutBtn);
  modalDivLogOut.appendChild(modalIconLogOut);

  userProfileModal.appendChild(modalDivMyProfile);
  userProfileModal.appendChild(modalDivLogOut);

  userSelector.appendChild(username);
  userSelector.appendChild(modalArrow);
  userSelector.appendChild(userProfileModal);

  userProfile.appendChild(userAvatar);
  userProfile.appendChild(userSelector);

  // Assemble the components
  // userBlock.appendChild(messageButton);
  userBlock.appendChild(notificationButton);

  userBlock.appendChild(createPostLink);
  userBlock.appendChild(userProfile);

  navbar.appendChild(navStart);
  navbar.appendChild(userBlock);


  return navbar;
}

