async function loadBluetoothStatus() {
  const stdout = await call_plugin_method('get_bluetooth_status');
  document.querySelector('#bluetoothStatus').innerText = /Powered: (.*)/.exec(stdout)[1] === 'yes' 
    ? 'Bluetooth status: ON'
    : 'Bluetooth status: OFF';
}

async function getPairedDevices() {
  setLoader(true);

  const pairedDevices = await call_plugin_method('get_paired_devices');
  console.log('pairedDevices: ', pairedDevices);

  // Get MAC address and device name of paired devices
  const pairedDevicesWithInfo = [];
  for (let captureGroups of [...pairedDevices.matchAll(/Device (([0-9A-F]{2}[:-]){5}([0-9A-F]{2})) (.*)$/gmi)]) {
    const mac = captureGroups[1];
    const name = captureGroups[4];

    const rawInfo = await call_plugin_method('get_device_info', { device: mac });
    pairedDevicesWithInfo.push({
      mac,
      name,
      connected: /Connected: yes/.test(rawInfo),
      icon: /Icon: (.*)/.exec(rawInfo)[1],
    });
  }
  setLoader(false);
  return pairedDevicesWithInfo;
}

function toggleDeviceConnection(device, status) {
  console.log(device);
  console.log(status);
  setLoader(true);
  call_plugin_method('set_device_connection', { device, status }).then(stdout => {
    setLoader(false, 0);
    refreshPairedList();
    console.log(stdout);
  });
}

function setLoader(state, disableTimeout = 300) {
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
    let deviceSVG;

    switch (device.icon) {
    case ('input-gaming'):
      deviceSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M32.62 9.14C32.62 9.14 28.5 5 18 5C7.5 5 3.38 9.14 3.38 9.14C3.38 9.14 0 20.56 0 25.2C0 28.68 5 31 5 31L11 25H25L31 31C31 31 36 28.68 36 25.2C36 20.56 32.62 9.14 32.62 9.14ZM15 17H12V20H9V17H6V14H9V11H12V14H15V17ZM21.5 20C21.0055 20 20.5222 19.8534 20.1111 19.5787C19.7 19.304 19.3795 18.9135 19.1903 18.4567C19.0011 17.9999 18.9516 17.4972 19.048 17.0123C19.1445 16.5273 19.3826 16.0819 19.7322 15.7322C20.0819 15.3826 20.5273 15.1445 21.0123 15.048C21.4972 14.9516 21.9999 15.0011 22.4567 15.1903C22.9135 15.3795 23.304 15.7 23.5787 16.1111C23.8534 16.5222 24 17.0055 24 17.5C24 17.8283 23.9353 18.1534 23.8097 18.4567C23.6841 18.76 23.4999 19.0356 23.2678 19.2678C23.0356 19.4999 22.76 19.6841 22.4567 19.8097C22.1534 19.9353 21.8283 20 21.5 20ZM27.5 16C27.0055 16 26.5222 15.8534 26.1111 15.5787C25.7 15.304 25.3795 14.9135 25.1903 14.4567C25.0011 13.9999 24.9516 13.4972 25.048 13.0123C25.1445 12.5273 25.3826 12.0819 25.7322 11.7322C26.0819 11.3826 26.5273 11.1445 27.0123 11.048C27.4972 10.9516 27.9999 11.0011 28.4567 11.1903C28.9135 11.3795 29.304 11.7 29.5787 12.1111C29.8534 12.5222 30 13.0055 30 13.5C30 14.163 29.7366 14.7989 29.2678 15.2678C28.7989 15.7366 28.163 16 27.5 16Z" fill="currentColor"></path></svg>';
      break;

    case ('audio-headset'):
    case ('audio-headphones'):
    default:
      deviceSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path d="M32 18.05C32 14.337 30.525 10.7761 27.8995 8.15055C25.274 5.52504 21.713 4.05005 18 4.05005C14.287 4.05005 10.726 5.52504 8.1005 8.15055C5.475 10.7761 4 14.337 4 18.05C4.00415 18.94 4.09457 19.8275 4.27 20.7001C4.27 20.7001 4.93 25.78 10 32.05L15 29.05L12 21.05H8.47C8.15762 20.0807 7.99903 19.0685 8 18.05C8 15.3979 9.05357 12.8543 10.9289 10.979C12.8043 9.10362 15.3478 8.05005 18 8.05005C20.6522 8.05005 23.1957 9.10362 25.0711 10.979C26.9464 12.8543 28 15.3979 28 18.05C28.001 19.0685 27.8424 20.0807 27.53 21.05H24L21 29.05L26 32.05C31.07 25.78 31.74 20.7001 31.74 20.7001C31.9121 19.8272 31.9991 18.9397 32 18.05Z" fill="currentColor"></path></svg>';
      break;
    }

    div.innerHTML =
      `<div class="gamepaddialog_FieldLabelRow_2VcTl">
        <div class="gamepaddialog_FieldLabel_3jMlJ">
            <div class="gamepaddialog_FieldLeadIcon_3CGpa">
                ${deviceSVG}
            </div>
            <div>
                <span>${device.name}</span>
                <div class="gamepaddialog_FieldChildren_2rhav">
                    ${device.connected ?
    '<div class="bluetoothsettings_NotConnectedLabel_31Z4e connected">Connected</div>' :
    '<div class="bluetoothsettings_NotConnectedLabel_31Z4e">Not Connected</div>'}
                </div>
            </div>
        </div>
    </div>`;

    return div;
  }

  const devices = await getPairedDevices();
  const devicesDiv = document.querySelector('#devices');

  devicesDiv.querySelectorAll('.gamepaddialog_Field_eKmEX').forEach(e => e.remove());

  devices.forEach(device => {
    devicesDiv.insertAdjacentElement('beforeend', getDeviceRowHTML(device));
  });
}
