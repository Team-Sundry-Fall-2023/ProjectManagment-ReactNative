import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, get, remove} from "firebase/database";

const MemberListScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const memberList = [];
        const currentUser = auth.currentUser;
        const currentUserEmail = currentUser.email;
        console.log('currentUser ' + currentUserEmail )
        const userQuery = query(ref(database, 'users'),orderByChild('email'));
        console.log('userQuery' + userQuery )
        get(userQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const members = snapshot.val();
                Object.keys(members).forEach((memberId) => {
                    const member = members[memberId];
                    console.log('member: ', member);
                    memberList.push(member);
                });
                console.log('memberList ' + memberList.length )
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

  const getMemberIdByEmail = async (email) => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
  
      if (snapshot.exists()) {
        const members = snapshot.val();
  
        // Iterate through the members to find the one with the matching email
        for (const memberId in members) {
          const member = members[memberId];
          if (member.email === email) {
            console.log('Member found:', member);
            return memberId; // Return the doc.id (memberId) when a matching member is found
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
            if (member) {
                try {
                  const memberRef = ref(database, `users/${memberId}`);
                  await remove(memberRef);
                  const updatedMembers = members.filter((m) => m.email !== member.email);
                  console.log("updatedMembers", updatedMembers);
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
  
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };
  const handleViewDetails = (project) => {
    console.log('item edit ')
    //navigation.navigate('ProjectDetail', { projectObj: project });
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
          text: 'Delete',
          onPress: () => handleDelete(item),
          type: 'delete',
        },
        {
          text: 'View Details',
          onPress: () => handleViewDetails(item),
          type: 'default',
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          console.log('item edit ' +item)
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

      <Button
        title="Create Member"
        onPress={() => {
          navigation.navigate('CreateMember');
        }}
      />
    </View>
  );
};

export default MemberListScreen;
