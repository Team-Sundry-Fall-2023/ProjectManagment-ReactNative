import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { Card, Avatar, Header } from 'react-native-elements';
import { database } from './firebase';
import { ref, query, orderByChild, get, remove } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';

const MemberListScreen = () => {
  const navigation = useNavigation();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

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

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

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

  const handleViewTasksOfMember = (member) => {
    navigation.navigate('Task of Member', { member});
  };
  
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  const swipeoutBtns = (item) => [
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="pencil" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF9500',
      onPress: () => handleViewDetails(item),
    },
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="trash" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF3B30',
      onPress: () => handleDelete(item),
    },

  ];

  const filterMembers = () => {
    const query = searchQuery.toLowerCase();

    const filtered = members.filter((member) => {
      return member.firstName.toLowerCase().includes(query) 
            || member.lastName.toLowerCase().includes(query) 
            || member.email.toLowerCase().includes(query) 
            || member.category.toLowerCase().includes(query);
    });

    setFilteredMembers(filtered);
  };

  return (
    <View style={styles.container}>
      <Header
        containerStyle={styles.headerContainer}
        leftComponent={
          <Ionicons
            name='ios-arrow-back'
            size={24}
            color='#fff'
            onPress={() => navigation.goBack()}
          />
        }
        centerComponent={{ text: 'Members', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
        rightComponent={
          <Ionicons
            name='ios-add'
            size={24}
            color='#fff'
            onPress={handleRightButtonPress}
          />
        }
        backgroundColor='#87CEEB'
      />
      <View style={styles.searchInput}>
        <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)} />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <FontAwesome name="times" size={20} color="gray" />
            </TouchableOpacity>
          )}
      </View>
      <FlatList
        data={searchQuery ? filteredMembers : members}
        keyExtractor={(item) => item.email.toString()}
        renderItem={({ item }) => (
          <Swipeout right={swipeoutBtns(item)} autoClose backgroundColor='transparent'>
            <TouchableOpacity
              onPress={() => handleViewTasksOfMember(item)}
              style={styles.cardTouchable}
            >
              <Card containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  <Avatar
                    rounded
                    size="large"
                    source={require('./assets/img/avatar.jpg')} 
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{`${item.firstName} ${item.lastName}`}</Text>
                  </View>
                </View>
                <Card.Divider />
                <View style={styles.memberContainer}>
                  <Text><Ionicons name='ios-person' size={16} color="blue"/> {`${item.email}`}</Text>
                  <Text><Ionicons name='ios-briefcase' size={16} color="blue"/> {`${item.category}`}</Text>
                </View>
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
  headerContainer: {
    backgroundColor: '#87CEEB',
    borderBottomWidth: 0, 
  },
  cardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    marginLeft: 16,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberEmail: {
    color: '#666',
  },
  memberContainer: {
    marginTop: 10,
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
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingLeft: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    padding: 10,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MemberListScreen;
