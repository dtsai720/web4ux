import SelectField from './SelectField';

const DifficultyDeviceFilter = ({
  availableDevices,
  availableDifficulties,
  selectedDevice,
  selectedDifficulty,
  onDeviceChange,
  onDifficultyChange
}) => {
  return (
    <div className="d-flex align-items-center gap-3">
      <SelectField
        id="deviceSelect"
        label="Device"
        value={selectedDevice}
        options={availableDevices}
        onChange={onDeviceChange}
        className="form-select form-select-sm"
        style={{ minWidth: '120px' }}
      />

      <SelectField
        id="difficultySelect"
        label="Difficulty"
        value={selectedDifficulty}
        options={availableDifficulties}
        onChange={onDifficultyChange}
        className="form-select form-select-sm"
        style={{ minWidth: '100px' }}
      />
    </div>
  );
};

export default DifficultyDeviceFilter;
