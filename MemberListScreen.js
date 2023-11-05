import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, get, remove} from "firebase/database";
import { getAuth, deleteUser } from 'firebase/auth';

const MemberListScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const memberList = [];
        const userQuery = query(ref(database, 'users'),orderByChild('email'));
        get(userQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const members = snapshot.val();
                Object.keys(members).forEach((memberId) => {
                    const member = members[memberId];
                    memberList.push(member);
                });
                setMembers(memberList);
            } else {
                setMembers(memberList);
            }
        }).catch((error) => {
            setMembers(memberList);
            showAlert('Error','Error finding Members :', error.message);
            return null;
       });

  }, []);

  const handleRightButtonPress = () => {
    navigation.navigate('CreateMember', { members, setMembers });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleRightButtonPress}
          title="Add"
          color="#007BFF" 
        />
      ),
    });
  }, [navigation]);

  const getMemberIdByEmail = async (email) => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
  
      if (snapshot.exists()) {
        const members = snapshot.val();
  
        for (const memberId in members) {
          const member = members[memberId];
          if (member.email === email) {
            return memberId; 
          }
        }
  
        console.log('No member found with email:', email);
        return null;
      } else {
        console.log('No member data found in "users"');
        return null;
      }
    } catch (error) {
      console.error('Error getting member by email:', error);
      return null;
    }
  };
  
  
    const handleDelete = async (member) => {
        Alert.alert(
        'Confirmation',
        'Are you sure you want to delete this member?',
        [
            { text: 'Cancel', style: 'cancel' },
            {
            text: 'Delete',
            onPress: async () => {
                const memberId = await getMemberIdByEmail(member.email);
                if (memberId) {
                    try {
                        const memberRef = ref(database, `users/${memberId}`);
                        await remove(memberRef);

                        const auth = getAuth();
                        deleteUser(auth.currentUser)
                            .then(() => {
                                console.log('Successfully deleted user');
                            })
                            .catch((error) => {
                                console.log('Error deleting user:', error);
                            });

                        const updatedMembers = members.filter((m) => m.email !== member.email);
                        setMembers(updatedMembers);
                    } catch (error) {
                        console.error('Error deleting member:', error);
                    }
                }
            },
            },
        ]
        );
    };

    const handleViewDetails = (member) => {
        navigation.navigate('CreateMember', { members, setMembers, memberToEdit: member });
    };


    const showAlert = (title, message) => {
        Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
    };

    return (
        <View>
            <FlatList
                data={members}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Swipeout
                        right={[
                            {
                                text: 'Edit',
                                onPress: () => handleViewDetails(item),
                                type: 'default',
                            },
                            {
                                text: 'Delete',
                                onPress: () => handleDelete(item),
                                type: 'delete',
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                console.log('view task of' + item.email)
                                //navigation.navigate('EditProject', {projectObj:item });
                            }}
                        >
                            <View>
                                <Text>{item.firstName} {item.lastName}</Text>
                                <Text>{item.email}</Text>
                                <Text>{item.category}</Text>
                            </View>
                        </TouchableOpacity>
                    </Swipeout>
                )}
            />
        </View>
    );
};

export default MemberListScreen;
