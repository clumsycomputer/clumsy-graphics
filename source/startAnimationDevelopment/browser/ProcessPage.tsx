import { makeStyles, Theme, useTheme } from '@material-ui/core'
import React, { Fragment, HTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientGraphicsRendererProcessState } from '../models/ClientGraphicsRendererProcessState'
import { Page } from './Page'

export interface ProcessPageProps
  extends Pick<
      ClientGraphicsRendererProcessState,
      | 'bundleSessionVersion'
      | 'graphicsRendererProcessKey'
      | 'graphicsRendererProcessStatus'
    >,
    Pick<
      ClientGraphicsRendererProcessState['animationModule'],
      'animationName'
    > {
  baseRoute: '/animation' | `/frame/${number}`
  childRoute: '/logs' | '/result'
  childContent: ReactNode
}

export function ProcessPage(props: ProcessPageProps) {
  const {
    childRoute,
    baseRoute,
    animationName,
    bundleSessionVersion,
    graphicsRendererProcessKey,
    graphicsRendererProcessStatus,
    childContent,
  } = props
  const styles = useStyles()
  const navigateToRoute = useNavigate()
  return (
    <Page
      pageBody={
        <Fragment>
          <div className={styles.pageOverview}>
            <div className={styles.pageNavigation}>
              <OptionField
                optionLabel={'logs'}
                optionSelected={childRoute === '/logs'}
                onClick={() => {
                  navigateToRoute(`${baseRoute}/logs`)
                }}
              />
              <OptionField
                optionLabel={'result'}
                optionSelected={childRoute === '/result'}
                onClick={() => {
                  navigateToRoute(`${baseRoute}/result`)
                }}
              />
            </div>
            <div className={'pageDetails'}>
              <FieldDisplay
                fieldLabel={'animation name'}
                fieldValue={animationName}
              />
              <FieldDisplay
                fieldLabel={'session version'}
                fieldValue={`${bundleSessionVersion}`}
              />
              <FieldDisplay
                fieldLabel={'process key'}
                fieldValue={graphicsRendererProcessKey}
              />
              <FieldDisplay
                fieldLabel={'process status'}
                fieldValue={getProcessStatusMessage({
                  graphicsRendererProcessStatus,
                })}
              />
            </div>
          </div>
          {childContent}
        </Fragment>
      }
    />
  )
}

export const useStyles = makeStyles((theme) => ({
  pageOverview: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
  },
  pageNavigation: {
    display: 'flex',
    flexDirection: 'column',
  },
}))

interface GetProcessStatusMessageApi
  extends Pick<ProcessPageProps, 'graphicsRendererProcessStatus'> {}

function getProcessStatusMessage(api: GetProcessStatusMessageApi) {
  const { graphicsRendererProcessStatus } = api
  if (graphicsRendererProcessStatus === 'processActive') {
    return 'in progress...'
  } else if (graphicsRendererProcessStatus === 'processSuccessful') {
    return 'success'
  } else if (graphicsRendererProcessStatus === 'processFailed') {
    return 'error'
  } else {
    throw new Error('wtf? getProcessStatusMessage')
  }
}

interface OptionFieldProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  optionLabel: string
  optionSelected: boolean
}

function OptionField(props: OptionFieldProps) {
  const { optionLabel, optionSelected, onClick } = props
  const theme = useTheme()
  const styles = useOptionFieldStyles(props)
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.optionInputContainer}>
        <div className={styles.optionInput} onClick={onClick}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: optionSelected
                ? theme.palette.primary.main
                : theme.palette.common.white,
            }}
          />
        </div>
      </div>
      <div className={styles.optionLabel}>{optionLabel}</div>
    </div>
  )
}

const useOptionFieldStyles = makeStyles<Theme, OptionFieldProps>((theme) => ({
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  optionInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: theme.spacing(1),
  },
  optionInput: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ({ optionSelected }) =>
      optionSelected ? theme.palette.primary.main : theme.palette.primary.light,
    backgroundColor: theme.palette.common.white,
    width: theme.spacing(1.25),
    height: theme.spacing(1.25),
    padding: 2,
  },
  optionLabel: {
    fontWeight: 600,
  },
}))

interface FieldDisplayProps {
  fieldLabel: string
  fieldValue: string
}

function FieldDisplay(props: FieldDisplayProps) {
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
