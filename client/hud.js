const hudElements = ["inventory","craftlist","name","fuel","shield","hp","compassImg","left_panel","toggle_left_panel"];

let hud = {};

for(let i in hudElements) {
  hud[hudElements[i]] = document.getElementById(hudElements[i]);
}


let sw = true;

hud.toggle_left_panel.onclick = ()=>{
  if(sw) {
    hud.left_panel.style.visibility = "hidden";
    hud.toggle_left_panel.style.visibility = "visible";
    hud.toggle_left_panel.innerHTML = " > ";
    sw = false;
  } else {
    hud.left_panel.style.visibility = "visible";
    hud.toggle_left_panel.style.visibility = "visible";
    hud.toggle_left_panel.innerHTML = " < ";
    sw = true;
  }
}

function drawHUD() {
  if(selfId) {
    let Player = Ship.list[selfId];
    hud.hp.max = Player.hpMax;
    hud.hp.value = Player.hp;

    hud.shield.max = Player.shieldMaxHP;
    hud.shield.value = Player.shieldHP;

    hud.fuel.max = Player.fuelMax;
    hud.fuel.value = Item.list[Player.fuel].amount;

    hud.compassImg.style.transform = "rotate(" + Player.angle + "rad)";
  }
}
