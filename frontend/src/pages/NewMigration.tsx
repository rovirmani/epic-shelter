import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'

const steps = ['Select Source', 'Select Destination', 'Configure Migration']

const dataLakeTypes = [
  { value: 'aws_s3', label: 'AWS S3' },
  { value: 'azure_blob', label: 'Azure Blob Storage' },
  { value: 'gcs', label: 'Google Cloud Storage' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'databricks', label: 'Databricks' },
]

export default function NewMigration() {
  const [activeStep, setActiveStep] = useState(0)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const onSubmit = (data: any) => {
    console.log(data)
    // TODO: Submit migration configuration to backend
    navigate('/migrations')
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Source Type"
                {...register('sourceType', { required: 'Source type is required' })}
                error={!!errors.sourceType}
                helperText={errors.sourceType?.message?.toString()}
              >
                {dataLakeTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Connection String"
                {...register('sourceConnection', { required: 'Connection string is required' })}
                error={!!errors.sourceConnection}
                helperText={errors.sourceConnection?.message?.toString()}
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Destination Type"
                {...register('destType', { required: 'Destination type is required' })}
                error={!!errors.destType}
                helperText={errors.destType?.message?.toString()}
              >
                {dataLakeTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Connection String"
                {...register('destConnection', { required: 'Connection string is required' })}
                error={!!errors.destConnection}
                helperText={errors.destConnection?.message?.toString()}
              />
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Migration Name"
                {...register('name', { required: 'Migration name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message?.toString()}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="SQL Transform Query (Optional)"
                {...register('transformQuery')}
              />
            </Grid>
          </Grid>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        New Migration
      </Typography>
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" type="submit">
                  Start Migration
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
