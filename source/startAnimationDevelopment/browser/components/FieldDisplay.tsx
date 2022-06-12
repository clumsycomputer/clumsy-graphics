import { makeStyles } from '@material-ui/core/styles'
import React from 'react'

export interface FieldDisplayProps {
  fieldLabel: string
  fieldValue: string
}

export function FieldDisplay(props: FieldDisplayProps) {
  const { fieldLabel, fieldValue } = props
  const styles = useFieldDisplayStyles()
  return (
    <div className={styles.displayContainer}>
      <div className={styles.fieldLabel}>{fieldLabel.toLowerCase()}:</div>
      <div className={styles.fieldValue}>{fieldValue.toLowerCase()}</div>
    </div>
  )
}

const useFieldDisplayStyles = makeStyles((theme) => ({
  displayContainer: {
    marginBottom: theme.spacing(0.25),
    display: 'flex',
    flexDirection: 'row',
  },
  fieldLabel: {
    fontWeight: 300,
    fontSize: 14,
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: 14,
    marginLeft: theme.spacing(1),
  },
}))
