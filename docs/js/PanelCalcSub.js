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

export {CalcPanelSub};

import {Panel} from './Panel.js';

/**
 * Base class for sub panels in CalcPanel
 * see CalcPanel
 */
class CalcPanelSub extends Panel {
  constructor(parent) {
    super();
    parent.appendChild(this._panel);
    this._panel.style.padding="5px";
    const hr=document.createElement("hr");
    hr.style.marginTop="3px";
    this._panel.appendChild(hr);
  }

  /**
   * Generates and adds a button element.
   * @param {Object} parent HTML parent element
   * @param {String} text Text to be shown on the button
   * @param {String} tooltip Tooltip for the button (can be empty)
   * @param {String} color Bootstrap color for the button ("btn-<color>")
   * @param {Object} onclick Callback to be executed when clicking the button
   * @returns New button (HTML element)
   */
  _createButton(parent, text, tooltip, color, onclick) {
    const button=document.createElement("button");
    button.type="button";
    button.className="me-2 mb-1 btn btn-sm btn-"+color;
    button.innerHTML=text;
    if (tooltip!='') button.title=tooltip;
    button.onclick=onclick;
    parent.appendChild(button);
    return button;
  }

  /**
   * Shows or hides the panel.
   * @param {boolean} visible Visible status
   */
  setVisible(visible) {
    this._panel.style.display=visible?"":"none";
  }

  /**
   * Stores data from this sub panel to localStorage.
   * @param {Object} data Object to store
   */
  _browserStore(data) {
    const name=this.constructor.name;
    try {
      localStorage.setItem(name,JSON.stringify(data));
    } catch (e) {}
  }

  /**
   * Loades data for this sub panel from localStorage.
   * @returns Previous saved data or null, if no data is available
   */
  _browserRestore() {
    const name=this.constructor.name;
    try {
      const compressedData=localStorage.getItem(name);
      if (compressedData==null) return null;
      return JSON.parse(compressedData);
    } catch (e) {
      return null;
    }
  }
}
