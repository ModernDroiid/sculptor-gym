let lastScroll = 0;

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

const currentScroll = window.pageYOffset;

if(currentScroll > lastScroll){

header.classList.add("header-hide");

}else{

header.classList.remove("header-hide");

}

lastScroll = currentScroll;

});

const locations = document.querySelectorAll(".location-item");
const map = document.getElementById("gym-map");

locations.forEach(location => {

location.addEventListener("click", () => {

locations.forEach(item =>
item.classList.remove("active")
);

location.classList.add("active");

map.src = location.dataset.map;

});

});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click",()=>{

nav.classList.toggle("active");

});