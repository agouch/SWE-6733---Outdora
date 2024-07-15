import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RadioGroup from 'react-native-radio-buttons-group';
const PreferencesScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Preferences Screen</Text>
      {/* UI to be */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PreferencesScreen;
