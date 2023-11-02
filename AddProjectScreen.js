import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase } from './firebase';

const AddProjectScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAddProject = async () => {
    const projectRef = firebase.firestore().collection('projects');
    const currentUser = auth.currentUser;
    try {
      await projectRef.add({
        name,
        description,
        ProjectCost: 0,
        user: currentUser.email
      });
      navigation.navigate('ProjectList');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <View>
      <Text>Add Project</Text>
      <TextInput
        placeholder="Project Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        placeholder="Project Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <Button title="Add Project" onPress={handleAddProject} />
    </View>
  );
};

export default AddProjectScreen;
