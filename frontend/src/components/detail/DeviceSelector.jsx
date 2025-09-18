import SelectField from './SelectField';

const DeviceSelector = ({ availableDevices, selectedDevice, onDeviceChange }) => {
  return (
    <SelectField
      id="device-selector"
      label="Device"
      icon="bi bi-display"
      value={selectedDevice}
      options={availableDevices}
      onChange={onDeviceChange}
      style={{ width: 'auto', minWidth: '200px' }}
    />
  );
};

export default DeviceSelector;
