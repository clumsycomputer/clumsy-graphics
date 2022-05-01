import { makeStyles } from '@material-ui/core'
import React, { ReactNode } from 'react'

export interface PageProps {
  pageBody: ReactNode
}

export function Page(props: PageProps) {
  const { pageBody } = props
  const styles = useStyles()
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>graphics-renderer</div>
      </div>
      {pageBody}
    </div>
  )
}

export const useStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      fontFamily: theme.typography.fontFamily,
    },
  },
  pageContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1.5),
  },
  pageTitle: {
    fontWeight: 600,
    fontSize: 18,
    color: theme.palette.common.white,
  },
}))
