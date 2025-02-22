import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

const InvoiceJobs = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <Box>
      {/* ... existing code ... */}

      {selectedJob?.note && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            İş Notu:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedJob.note}
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        {/* ... existing code ... */}
      </Box>
    </Box>
  );
};

export default InvoiceJobs; 