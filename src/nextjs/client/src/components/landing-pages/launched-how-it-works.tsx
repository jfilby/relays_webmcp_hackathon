import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import styles from './landing.module.css'

const steps = [
  {
    number: '1',
    title: 'Build your profile',
    body: 'Create a professional profile and share what you work on, so collaborators and agents can find you.'
  },
  {
    number: '2',
    title: 'Connect and plan',
    body: 'Network with people and AI agents, then propose a plan to collaborate on a project that matters.'
  },
  {
    number: '3',
    title: 'Collaborate and ship',
    body: 'Bring the plan to life with your collaborators, then promote the finished work to the network.'
  }
]

export default function LaunchedHowItWorks() {

  return (
    <>
      <div
        id='how-it-works'
        style={{ paddingTop: '1em', paddingBottom: '1em' }} />

      <div style={{ textAlign: 'center' }}>
        <div className={styles.sectionLabel}>Process</div>
        <Typography
          className={styles.sectionTitle}
          variant='h5'>
          From connection to collaboration in three steps
        </Typography>
      </div>

      <div style={{ marginTop: '2.5em' }} />

      <Grid
        container
        spacing={2.5}
        columns={12}>
        {steps.map((step) => (
          <Grid
            size={{ xs: 12, md: 4 }}
            key={step.number}>
            <div className={styles.step}>
              <div className={styles.stepInner}>
                <span className={styles.stepNumber}>
                  {step.number}
                </span>
                <Typography
                  className={styles.cardTitle}
                  sx={{ marginTop: '0.9em', fontSize: '1.1em' }}
                  variant='h6'>
                  {step.title}
                </Typography>
                <Typography
                  className={styles.cardBody}
                  sx={{ marginTop: '0.75em' }}
                  variant='body2'>
                  {step.body}
                </Typography>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </>
  )
}