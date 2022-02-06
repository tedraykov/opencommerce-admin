import React, {FC, Suspense} from "react";
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Sidebar from "./Sidebar";
import AppBar from "./AppBar";
import {Routes, Route} from "react-router-dom";
import {OperatorRoute, operatorRoutesDefinitions} from "@platform/router";
import Typography from "@mui/material/Typography";
import {useTranslation} from "react-i18next";

/**
 * Main dashboard layout
 */
const Dashboard: FC = () => {
  const {t} = useTranslation();

  return (
    <Box sx={{display: 'flex'}}>
      <AppBar/>
      <Sidebar/>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Routes>
          {operatorRoutesDefinitions.map((
            {
              Component,
              LayoutComponent,
              authenticated,
              title,
              ...props
            }, index) => (
            <Route
              key={index}
              {...props}
              element={(
                <>
                  <Toolbar>
                    <Typography
                      component="h1"
                      variant="h6"
                      color="inherit"
                      noWrap
                      sx={{ flexGrow: 1 }}
                    >
                      {title && t(title) || "Open Commerce"}
                    </Typography>
                  </Toolbar>
                  <OperatorRoute
                    LayoutComponent={LayoutComponent}
                    authenticated={authenticated}
                    title={title}
                    children={
                      <Suspense fallback={<></>}>
                        <Component/>
                      </Suspense>
                    }
                  />
                </>
              )}/>
          ))}
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;
