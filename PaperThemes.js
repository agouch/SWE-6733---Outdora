import { DefaultTheme } from 'react-native-paper';

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'blue',  
    accent: 'green',  

  },
};

export default CustomTheme;