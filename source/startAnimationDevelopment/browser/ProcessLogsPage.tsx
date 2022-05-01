import { makeStyles } from '@material-ui/core'
import React from 'react'
import { ProcessPage, ProcessPageProps } from './ProcessPage'

export interface ProcessLogsPageProps
  extends Pick<
    ProcessPageProps,
    | 'baseRoute'
    | 'animationModuleName'
    | 'animationModuleSessionVersion'
    | 'renderTarget'
  > {
  processStdoutLog: string
}

export function ProcessLogsPage(props: ProcessLogsPageProps) {
  const { processStdoutLog, ...processPageProps } = props
  const styles = useStyles()
  return (
    <ProcessPage
      {...processPageProps}
      childRoute={'/logs'}
      childContent={
        <div className={styles.logsDisplayContainer}>{processStdoutLog}</div>
      }
    />
  )
}

const useStyles = makeStyles((theme) => ({
  logsDisplayContainer: {
    flexShrink: 1,
    flexGrow: 1,
    padding: theme.spacing(1),
    overflow: 'scroll',
    lineHeight: '1.25rem',
    whiteSpace: 'pre-wrap',
    fontSize: 12,
  },
}))
