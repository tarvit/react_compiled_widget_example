import React from 'react';
import ReactDOM from "react-dom";

import CompiledReactWidget from '../compiled_react_widget';
import AppRoot from "../components/app_root";
import CrwLogger from "../logging/crw_logger";

const LoadWidget = function() {
  CompiledReactWidget.host = CompiledReactWidget.getHost();
  CompiledReactWidget.token = CompiledReactWidget.getToken();

  CrwLogger.info(`CRW widget init [${ CompiledReactWidget.version }]`, CompiledReactWidget);

  let container = document.getElementById(CompiledReactWidget.eateId);
  if (!container) {
    const widgetScript = document.getElementById(CompiledReactWidget.widgetId);
    container = document.createElement('div');
    container.id = CompiledReactWidget.eateId;
    widgetScript.parentElement.appendChild(container);
  }
  ReactDOM.render(<AppRoot />, document.getElementById(CompiledReactWidget.eateId));
};

LoadWidget();