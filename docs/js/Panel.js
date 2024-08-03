/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export {Panel, initSizeCalculation, setMinWidth, setMinHeight};

/**
 * Base class for all calculation panels
 */
class Panel {
  /**
   * Panel element containing all other GUI elements
   */
  _panel;

  constructor() {
    this._panel=document.createElement("div");
  }

  /**
   * Returns the panel element containing all other GUI elements.
   */
  get panel() {
    return this._panel;
  }

  /**
   * Creates and adds an input element.
   * @param {Object} parent Parent node
   * @param {Boolean} readOnly Read-only status (optional; default to false)
   * @param {String} placeholder Placeholder to be display in input element when empty (optional; default to "no placeholder")
   * @returns
   */
  _createInput(parent, readOnly=false, placeholder='') {
    const input=document.createElement("input");
    input.className="form-control";
    input.type="text";
    input.spellcheck=false;
    if (readOnly) input.readOnly=true;
    if (placeholder!='') input.placeholder=placeholder;
    parent.appendChild(input);
    return input;
  }

  /**
   * Creates and adds a div.
   * @param {Object} parent Parent node
   * @returns New div
   */
  _createDiv(parent) {
    const div=document.createElement("div");
    parent.appendChild(div);
    return div;
  }

  /**
   * Returns the minimum height for this panel (returns "null" for "calculate panel size" and values &le;0 for "do not set size").
   * @returns Minimum height for this panel.
   */
  getMinHeight() {
    return null;
  }

  #firstShow=true;

  /**
   * Notifies the tab that it will be displayed.
   */
  showNotify() {
    if (!this.#firstShow) return;
    this.#firstShow=false;
    this._firstShow();
  }

  _firstShow() {

  }
}

let widthDelta=0;
let heightDelta=0;
const verticalPadding=10+10;

function initSizeCalculation() {
  if (!isDesktopApp) return;
  Neutralino.window.getSize().then(size=>{
    widthDelta=Math.max(0,Math.ceil(size.width/window.devicePixelRatio-window.innerWidth))+10;
    heightDelta=Math.max(0,Math.ceil(size.height/window.devicePixelRatio-window.innerHeight))+10;
  });
}

/**
 * Sets the minimum window width in Neutralino mode.
 * @param {Number} minWidth Minimum window width (can be null if no height is to be set)
 */
function setMinWidth(minWidth) {
  if (minWidth==null || !isDesktopApp) return;

  Neutralino.window.getSize().then(size=>{
    if (heightDelta==0) {
      widthDelta=Math.max(0,Math.ceil(size.width/window.devicePixelRatio-window.innerWidth))+10;
      heightDelta=Math.max(0,Math.ceil(size.height/window.devicePixelRatio-window.innerHeight))+10;
    }
    Neutralino.window.setSize({width: Math.max(size.width,Math.ceil((minWidth+widthDelta)*window.devicePixelRatio))});
  });
}

/**
 * Sets the minimum window height in Neutralino mode.
 * @param {Number} minHeight Minimum window height (can be null if no height is to be set)
 * @param {Boolean} addNavHeight Increase size to respect height of nav area?
 *
 */
function setMinHeight(minHeight, addNavHeight) {
  if (minHeight==null || !isDesktopApp) return;

  if (addNavHeight) {
    const navs=document.getElementsByTagName("nav");
    minHeight+=(navs.length==0)?0:navs[0].offsetHeight;
  }
  minHeight+=verticalPadding;

  Neutralino.window.getSize().then(size=>{
    if (heightDelta==0) {
      widthDelta=Math.max(0,Math.ceil(size.width/window.devicePixelRatio-window.innerWidth))+10;
      heightDelta=Math.max(0,Math.ceil(size.height/window.devicePixelRatio-window.innerHeight))+10;
    }

    const appHeight=Math.max(size.height,Math.ceil((minHeight+heightDelta)*window.devicePixelRatio));
    Neutralino.window.setSize({height: appHeight});

    setTimeout(()=>{
      Neutralino.window.getPosition().then(pos=>{
        const desktopHeight=Math.round(screen.height*window.devicePixelRatio)-100;
        if (pos.y+appHeight>=desktopHeight) Neutralino.window.move(pos.x,Math.max(0,desktopHeight-appHeight));
      });
    },200);
  });
}
