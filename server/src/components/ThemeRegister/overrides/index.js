import { alpha } from "@mui/material/styles"
import { outlinedInputClasses } from "@mui/material/OutlinedInput"

// ----------------------------------------------------------------------

export default function overrides(theme) {
  const isLight = theme.palette.mode === "light"
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        html: {
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
          WebkitOverflowScrolling: "touch",
        },
        body: {
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%",
        },
        "#root": {
          width: "100%",
          height: "100%",
        },
        input: {
          "&[type=number]": {
            MozAppearance: "textfield",
            "&::-webkit-outer-spin-button": {
              margin: 0,
              WebkitAppearance: "none",
            },
            "&::-webkit-inner-spin-button": {
              margin: 0,
              WebkitAppearance: "none",
            },
          },
        },
        img: {
          maxWidth: "100%",
          display: "inline-block",
          verticalAlign: "bottom",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[900], 0.8),
        },
        invisible: {
          background: "transparent",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedInherit: {
          color: theme.palette.common.white,
          backgroundColor: theme.palette.grey[800],
          "&:hover": {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.grey[800],
          },
        },
        sizeLarge: {
          minHeight: 48,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: theme.customShadows.card,
          // borderRadius: theme.shape.borderRadius,
          position: "relative",
          zIndex: 0, // Fix Safari overflow: hidden with border radius
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: "h6" },
        subheaderTypographyProps: { variant: "body2" },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          [`& .${outlinedInputClasses.notchedOutline}`]: {
            borderColor: alpha(theme.palette.grey[500], 0.24),
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: theme.palette.grey[800],
        },
        arrow: {
          color: theme.palette.grey[800],
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        paragraph: {
          marginBottom: theme.spacing(2),
        },
        gutterBottom: {
          marginBottom: theme.spacing(1),
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...theme.typography.body2,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          flex: 1,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0, 3),
          [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 2, 0, 2),
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: `${theme.spacing(3)} !important`,
          [theme.breakpoints.down("sm")]: {
            padding: `${theme.spacing(2)} !important`,
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: theme.spacing(0, 3, 3),
          [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(0, 2, 2),
          },
          "& > :not(:first-of-type)": {
            marginLeft: theme.spacing(2),
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          boxShadow: theme.customShadows.z1,
        },
        track: {
          opacity: 1,
          backgroundColor: theme.palette.grey[500],
        },
        switchBase: {
          left: 0,
          right: "auto",
          "&:not(:.Mui-checked)": {
            color: theme.palette.grey[isLight ? 100 : 300],
          },
          "&.Mui-checked.Mui-disabled, &.Mui-disabled": {
            color: theme.palette.grey[isLight ? 400 : 600],
          },
          "&.Mui-disabled+.MuiSwitch-track": {
            opacity: 1,
            backgroundColor: `${theme.palette.action.disabledBackground} !important`,
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.z4,
          borderRadius: theme.shape.borderRadius / 2,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 48,
          [theme.breakpoints.up("xs")]: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
          },
          [theme.breakpoints.up("sm")]: {
            minHeight: 56,
          },
        },
      },
    },
  }
}
