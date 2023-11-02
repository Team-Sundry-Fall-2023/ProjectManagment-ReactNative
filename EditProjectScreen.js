import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase } from './firebase';

const EditProjectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { project } = route.params;
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  const handleEditProject = async () => {
    const projectRef = firebase.firestore().collection('projects').doc(project.id);

    try {
      await projectRef.update({
        name,
        description,
      });
      navigation.navigate('ProjectList');
    } catch (error) {
      console.error('Error editing project:', error);
    }
  };

  return (
    <View>
      <Text>Edit Project</Text>
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
      <Button title="Edit Project" onPress={handleEditProject} />
    </View>
  );
};

export default EditProjectScreen;
