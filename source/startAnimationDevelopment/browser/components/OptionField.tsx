import Link, { LinkProps } from '@material-ui/core/Link'
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface OptionFieldProps extends Pick<Required<LinkProps>, 'href'> {
  optionLabel: string
  optionSelected: boolean
}

export function OptionField(props: OptionFieldProps) {
  const { optionLabel, optionSelected, href } = props
  const navigateToRoute = useNavigate()
  const theme = useTheme()
  const styles = useOptionFieldStyles(props)
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.optionInputContainer}>
        <Link
          tabIndex={optionSelected ? -1 : 0}
          href={href}
          onClick={() => {
            navigateToRoute(href)
          }}
        >
          <svg viewBox={`0 0 1 1`} className={styles.optionInput}>
            <rect
              fill={theme.palette.secondary.main}
              x={0}
              y={0}
              width={1}
              height={1}
            />
            <rect
              fill={theme.palette.common.white}
              x={0.05}
              y={0.05}
              width={0.9}
              height={0.9}
            />
            <rect
              fill={
                optionSelected ? theme.palette.secondary.main : 'transparent'
              }
              x={0.2}
              y={0.2}
              width={0.6}
              height={0.6}
            />
          </svg>
        </Link>
      </div>
      <div className={styles.optionLabel}>{optionLabel}</div>
    </div>
  )
}

const useOptionFieldStyles = makeStyles<Theme, OptionFieldProps>((theme) => ({
  fieldContainer: {
    marginBottom: theme.spacing(0.25),
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
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  optionLabel: {
    fontWeight: 600,
  },
}))
