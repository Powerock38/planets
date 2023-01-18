const hud = document.getElementById("hud") as HTMLDivElement;

export function hudText(id: string, text: string) {
  const elem = hud.querySelector("div#" + id);
  if (elem) {
    elem.textContent = text;
  } else {
    const elem = document.createElement("div");
    elem.id = id;
    elem.className = "hud-text";
    elem.textContent = text;
    hud.appendChild(elem);
  }
}

export function hudButton(id: string, text: string, onClick: () => void) {
  const button = hud.querySelector("button#" + id);
  if (button) {
    button.textContent = text;
  } else {
    const button = document.createElement("button");
    button.style.pointerEvents = "auto";
    button.style.margin = "10px";
    button.textContent = text;
    button.addEventListener("click", onClick);
    hud.appendChild(button);
  }
}

export function hudSlider(
  id: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void
) {
  const slider = hud.querySelector("input#" + id) as HTMLInputElement | null;
  if (slider) {
    slider.value = value.toString();
  } else {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = value.toString();
    slider.style.pointerEvents = "auto";
    slider.style.margin = "10px";
    slider.addEventListener("input", () => onChange(parseFloat(slider.value)));
    hud.appendChild(slider);
  }
}
