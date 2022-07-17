import React, { ReactNode } from 'react'
import { makeStyles } from '@material-ui/core/styles'

export interface PageProps {
  assetRouteSelect: ReactNode
  pageBody: ReactNode
}

export function Page(props: PageProps) {
  const { assetRouteSelect, pageBody } = props
  const styles = usePageStyles()
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleContainer}>
          <div className={styles.pageTitle}>clumsy-graphics</div>
        </div>
        <div className={styles.selectContainer}>{assetRouteSelect}</div>
      </div>
      {pageBody}
    </div>
  )
}

export const usePageStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      fontFamily: theme.typography.fontFamily,
    },
    a: {
      '&:focus': {
        outlineColor: '#ede158',
        outlineStyle: 'solid',
        outlineWidth: theme.spacing(1 / 3),
      },
    },
  },
  pageContainer: {
    border: 'none',
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
    alignItems: 'baseline',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1.5),
  },
  titleContainer: {
    flexGrow: 1,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  selectContainer: {
    flexShrink: 0,
  },
}))
