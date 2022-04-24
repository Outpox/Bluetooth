function handleBluetoothStatus() {
  call_plugin_method("get_bluetooth_status").then(stdout => {
    console.log(stdout);
    // document.querySelector('#bluetoothStatus').innerHTML = stdout;
    let powered = /Powered: yes/.test(stdout)
    if (powered) {
      document.querySelector('#bluetoothToggle').classList.add('gamepaddialog_On_yLrDA');
    }
  })
}

async function getPairedDevices(count = 0) {
  setLoader(true);

  if (count >= 5) {
    console.log('Cannot get paired devices... stopping after 5 attempts')
    setLoader(false);
    return;
  }

  const pairedDevices = await call_plugin_method("get_paired_devices");
  console.log('pairedDevices: ', pairedDevices);
  // Sometimes `bluetoothctl paired-devices` returns the result of `bluetoothctl show` so retry
  if (pairedDevices.startsWith('Controller')) {
    console.log(`Unexpected paired-devices output, retrying (counter: ${count})...`)
    return getPairedDevices(count++);
  }

  // Get MAC address and device name of paired devices
  return await Promise.all([...pairedDevices.matchAll(/Device (([0-9A-F]{2}[:-]){5}([0-9A-F]{2})) (.*)$/gmi)].map(
    async (captureGroups) => {
      console.log('captureGroups: ', captureGroups);
      // Get more information for the given MAC address
      const rawInfo = await call_plugin_method("get_device_info", { device: captureGroups[1] });
      const connected = /Connected: yes/.test(rawInfo);

      setLoader(false);
      
      return {
        mac: captureGroups[1],
        name: captureGroups[4],
        connected,
      };
    }
  ));
}

function toggleDeviceConnection(device, status) {
  console.log(device);
  console.log(status);
  setLoader(true);
  call_plugin_method("set_device_connection", { device, status }).then(stdout => {
    setLoader(false, 0);
    refreshPairedList();
    console.log(stdout);
  });
}

function setLoader(state, disableTimeout=300) {
  const loader = document.querySelector('#loader');
  const refresh = document.querySelector('#refresh');
  if (state) {
    refresh.style.display = 'none';
    loader.style.display = '';
  } else {
    setTimeout(() => {
      refresh.style.display = '';
      loader.style.display = 'none';
    }, disableTimeout);
  }
}

async function refreshPairedList() {
  function getDeviceRowHTML(device) {
    const div = document.createElement('div');
    div.classList.add(
      'gamepaddialog_Field_eKmEX',
      'gamepaddialog_WithFirstRow_2bDqk',
      'gamepaddialog_InlineWrapShiftsChildrenBelow_3LCXh',
      'gamepaddialog_WithBottomSeparator_3YKpU',
      'gamepaddialog_ExtraPaddingOnChildrenBelow_3nLNL',
      'gamepaddialog_StandardPadding_xIITX',
      'gamepaddialog_Clickable_2Huzv',
      'gamepaddialog_HighlightOnFocus_2HFrm',
      'Panel',
      'Focusable'
    );

    if (!device.connected) {
      div.classList.add('gamepaddialog_Disabled_aIeh3');
    }

    div.onclick = () => toggleDeviceConnection(device.mac, device.connected);

    div.innerHTML =
      `<div class="gamepaddialog_FieldLabelRow_2VcTl">
        <div class="gamepaddialog_FieldLabel_3jMlJ">
            <div class="gamepaddialog_FieldLeadIcon_3CGpa">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M32 18.05C32 14.337 30.525 10.7761 27.8995 8.15055C25.274 5.52504 21.713 4.05005 18 4.05005C14.287 4.05005 10.726 5.52504 8.1005 8.15055C5.475 10.7761 4 14.337 4 18.05C4.00415 18.94 4.09457 19.8275 4.27 20.7001C4.27 20.7001 4.93 25.78 10 32.05L15 29.05L12 21.05H8.47C8.15762 20.0807 7.99903 19.0685 8 18.05C8 15.3979 9.05357 12.8543 10.9289 10.979C12.8043 9.10362 15.3478 8.05005 18 8.05005C20.6522 8.05005 23.1957 9.10362 25.0711 10.979C26.9464 12.8543 28 15.3979 28 18.05C28.001 19.0685 27.8424 20.0807 27.53 21.05H24L21 29.05L26 32.05C31.07 25.78 31.74 20.7001 31.74 20.7001C31.9121 19.8272 31.9991 18.9397 32 18.05Z" fill="currentColor"></path></svg>
            </div>
            <div>
                <span>${device.name}</span>
                <div class="gamepaddialog_FieldChildren_2rhav">
                    ${device.connected ? 
                    `<div class="bluetoothsettings_NotConnectedLabel_31Z4e connected">Connected</div>` :
                    `<div class="bluetoothsettings_NotConnectedLabel_31Z4e">Not Connected</div>`}
                </div>
            </div>
        </div>
    </div>`

    return div;
  }

  const devices = await getPairedDevices();
  const devicesDiv = document.querySelector('#devices');

  devicesDiv.querySelectorAll('.gamepaddialog_Field_eKmEX').forEach(e => e.remove());

  devices.forEach(device => {
    devicesDiv.insertAdjacentElement('beforeend', getDeviceRowHTML(device));
  });
}

// function injectIntoNativeUI(devices) {
//   function getDeviceRowHTML(device, last = false) {
//       const div = document.createElement('div');
//       div.classList.add('quickaccesscontrols_PanelSectionRow_26R5w', 'SDH_Bluetooth');

//       div.innerHTML =
//           `<div class="gamepaddialog_Field_eKmEX gamepaddialog_WithFirstRow_2bDqk gamepaddialog_ExtraPaddingOnChildrenBelow_3nLNL gamepaddialog_CompactPadding_3hgIZ gamepaddialog_HighlightOnFocus_2HFrm${last ? ' gamepaddialog_WithBottomSeparator_3YKpU' : ''} Panel Focusable" style="--indent-level:0;">
//               <div class="gamepaddialog_FieldLabelRow_2VcTl">
//                   <div class="gamepaddialog_FieldLabel_3jMlJ">
//                       <div class="gamepaddialog_FieldLeadIcon_3CGpa">
//                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path d="M32 18.05C32 14.337 30.525 10.7761 27.8995 8.15055C25.274 5.52504 21.713 4.05005 18 4.05005C14.287 4.05005 10.726 5.52504 8.1005 8.15055C5.475 10.7761 4 14.337 4 18.05C4.00415 18.94 4.09457 19.8275 4.27 20.7001C4.27 20.7001 4.93 25.78 10 32.05L15 29.05L12 21.05H8.47C8.15762 20.0807 7.99903 19.0685 8 18.05C8 15.3979 9.05357 12.8543 10.9289 10.979C12.8043 9.10362 15.3478 8.05005 18 8.05005C20.6522 8.05005 23.1957 9.10362 25.0711 10.979C26.9464 12.8543 28 15.3979 28 18.05C28.001 19.0685 27.8424 20.0807 27.53 21.05H24L21 29.05L26 32.05C31.07 25.78 31.74 20.7001 31.74 20.7001C31.9121 19.8272 31.9991 18.9397 32 18.05Z" fill="currentColor"></path></svg>
//                       </div>
//                       <div onclick="toggleDeviceConnection('${device.mac}', ${!device.connected})">
//                           <span>${device.name}</span></br>
//                           <span>Connected: ${device.connected}</span>
//                       </div>
//                   </div>
//               </div>
//           </div>`;
//       return div;
//   }

//   document.querySelectorAll('.quickaccesscontrols_PanelSectionRow_26R5w.SDH_Bluetooth').forEach(e => e.remove());

//   const FIELD_CLASS = "gamepaddialog_FieldLabel_3jMlJ";
//   const bluetoothLabel = Array.from(document.querySelectorAll(`.${FIELD_CLASS}`))
//       .find(label => label.innerText === "Bluetooth");

//   console.log('bluetoothLabel: ', bluetoothLabel);

//   const mainRow = bluetoothLabel
//       .parentElement // FieldLabelRow
//       .parentElement // Field
//       .parentElement // PanelSectionRow

//   devices.reverse().forEach((device, i) => {
//       console.log('device: ', device);
//       console.log('i === 0: ', i === 0);
//       mainRow.insertAdjacentElement('afterend', getDeviceRowHTML(device, i === 0));
//   })
// }