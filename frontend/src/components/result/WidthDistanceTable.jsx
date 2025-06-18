import React from 'react';
import { formatNumber, formatPercentage } from '../../utils/result/resultUtils';

/**
 * Table component for displaying width and distance combinations
 */
const WidthDistanceTable = ({ selectedDevice, resultData }) => {
  return (
    <div>
      <h6 className="border-bottom pb-2 mb-3">
        <i className="bi bi-display me-2"></i>
        Device: {selectedDevice} - Width and Distance Combinations
      </h6>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Width</th>
              <th>Distance</th>
              <th>Total Trails</th>
              <th>Available Trails</th>
              <th>Failed Trails</th>
              <th>Error Rate</th>
              <th>Avg Event Time</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(resultData[selectedDevice].widths).sort((a, b) => b - a).map(width =>
              Object.keys(resultData[selectedDevice].widths[width].distances).sort((a, b) => a - b).map(distance => {
                const distanceData = resultData[selectedDevice].widths[width].distances[distance];
                return (
                  <tr key={`${width}-${distance}`}>
                    <td>{Math.log2(distance/width + 1).toFixed(1)}</td>
                    <td>{width}</td>
                    <td>{distance}</td>
                    <td>{distanceData.totalTrails}</td>
                    <td>{distanceData.availableTrails}</td>
                    <td>{distanceData.failedTrails}</td>
                    <td>{formatPercentage(distanceData.errorRate)}</td>
                    <td>{formatNumber(distanceData.avgEventTime)} ms</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="alert alert-info mt-3">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> All calculations only consider available and not deleted trails. Failed trails are defined as trails where there are other marks between the start and target marks.
        Error rate is calculated as the number of failed trails divided by the number of available trails.
      </div>
    </div>
  );
};

export default WidthDistanceTable;
