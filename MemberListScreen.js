import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert, StyleSheet } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { Card } from 'react-native-elements';
import { firebase, auth, database } from './firebase';
import { ref, query, orderByChild, get, remove } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MemberListScreen = () => {
  const navigation = useNavigation();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const memberList = [];
    const userQuery = query(ref(database, 'users'), orderByChild('email'));
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        const membersData = snapshot.val();
        const existingMembers = Object.values(membersData);
        setMembers(existingMembers);
      }
    }).catch((error) => {
      showAlert('Error', 'Error fetching existing members: ' + error.message);
    });

  }, []);

  const handleRightButtonPress = () => {
    navigation.navigate('Create Member', { members, setMembers });
  };

  const getMemberIdByEmail = async (email) => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const members = snapshot.val();

        for (const memberId in members) {
          const member = members[memberId];
          if (member.email === email) {
            console.log('Member found:', member);
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
    navigation.navigate('Create Member', { members, setMembers, memberToEdit: member });
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  const swipeoutBtns = (item) => [
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="trash" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF3B30',
      onPress: () => handleDelete(item),
    },
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="pencil" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#007AFF',
      onPress: () => handleViewDetails(item),
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={({ item }) => (
          <Swipeout right={swipeoutBtns(item)} autoClose backgroundColor='transparent'>
            <TouchableOpacity
              onPress={() => handleViewDetails(item)}
              style={styles.cardTouchable}
            >
              <Card containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.memberName}>{`${item.firstName} ${item.lastName}`}</Text>
                  {/* Add any additional member details here */}
                </View>
                <Card.Divider />
                <Text style={styles.memberDetail}>{item.email}</Text>
                <Text style={styles.memberDetail}>{item.category}</Text>
              </Card>
            </TouchableOpacity>
          </Swipeout>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={handleRightButtonPress}>
        <FontAwesome name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20, // This should match the border radius of the touchable if you have a card style
  },
  memberName: {
    alignItems: 'center',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  memberDescription: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 10,
  },
  swipeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 90,
    backgroundColor: '#5848ff',
    borderRadius: 28,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MemberListScreen;
