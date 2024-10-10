import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { FIRESTORE_DB } from '../firebaseConfig'; // Cấu hình Firebase
import { collection, getDocs } from 'firebase/firestore'; // SDK Firestore
import CartScreen from './CartScreen'; // Import component Giỏ hàng
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import biểu tượng
import Toast from 'react-native-toast-message'; // Import Toast

// Định nghĩa kiểu dữ liệu Service
type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl: string; // Thêm trường URL hình ảnh
};

const CustomerListService = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Trạng thái cho Giỏ hàng
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'Service'));
        const serviceList: Service[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Service, 'id'>,
        }));
        setServices(serviceList);
        setFilteredServices(serviceList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filteredData = services.filter(service =>
        service.ServiceName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredServices(filteredData);
    } else {
      setFilteredServices(services);
    }
  };

  const handleCheckout = () => {
    const totalAmount = cart.reduce((total, item) => total + item.Price, 0);
    navigation.navigate('CheckoutScreen', {
      cartItems: cart,
      totalAmount,
    });
    setCart([]); // Xóa giỏ hàng sau khi thanh toán
    setCartVisible(false);
    
    // Hiển thị thông báo đặt hàng thành công
    Toast.show({
      text1: 'Đặt hàng thành công',
      text2: 'Cảm ơn bạn đã đặt hàng!',
      visibilityTime: 3000,
      position: 'bottom',
      type: 'success',
    });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('DetailScreen', { service: item, cart, setCart })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.ImageUrl }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.ServiceName}</Text>
      <Text style={styles.itemPrice}>{item.Price} $</Text>
    </TouchableOpacity>
  );

  const renderRow = ({ item }: { item: Service[] }) => (
    <View style={styles.row}>
      {item.map(service => renderItem({ item: service }))}
    </View>
  );

  const groupedServices = filteredServices.reduce<Service[][]>((acc, service, index) => {
    if (index % 2 === 0) {
      acc.push([service]); // Tạo một mảng mới cho mỗi cặp
    } else {
      acc[acc.length - 1].push(service); // Thêm sản phẩm vào cặp hiện tại
    }
    return acc;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>KHÁCH HÀNG</Text>
        <Text style={styles.logo}>KAMI SPA</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm dịch vụ..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
          inputStyle={{ color: '#000' }}
        />
        <Text style={styles.serviceListHeaderText}>Danh sách dịch vụ</Text>
        <FlatList
          data={groupedServices}
          renderItem={renderRow}
          keyExtractor={(item, index) => index.toString()} // Sử dụng chỉ số để tạo key
        />
      </View>
      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>Trang chủ</Text>
        <TouchableOpacity onPress={() => setCartVisible(true)} style={styles.cartIconContainer}>
          <Icon name="shopping-cart" size={24} color="#FFC0CB" /> {/* Pink cart icon */}
          <Text style={[styles.cartCount, { color: '#FFC0CB' }]}>{cart.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
          <Text style={styles.navItem}>Cài đặt</Text>
        </TouchableOpacity>
      </View>

      {/* Component Giỏ hàng */}
      <CartScreen
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={(itemId: string) => setCart(cart.filter(item => item.id !== itemId))}
        onCheckout={handleCheckout}
      />

      {/* Toast Component */}
      <Toast />
    </View>
  );
};

// Định nghĩa styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC0CB', // Light pink
  },
  header: {
    backgroundColor: '#000', // Black
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC0CB', // Pink
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC0CB', // Pink
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFC0CB', // Light pink
  },
  searchInput: {
    borderColor: '#000', // Black
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#fff', // White for input
    color: '#000', // Black text
  },
  serviceListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Black
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', // Light gray
    width: '48%', // Two items per row
    alignItems: 'center',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Black
  },
  itemPrice: {
    fontSize: 14,
    color: '#666', // Medium gray
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#000', // Black
  },
  cartIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCount: {
    marginLeft: 5,
    color: '#FFC0CB', // Pink
    fontWeight: 'bold',
  },
  navItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFC0CB', // Pink
  },
});

export default CustomerListService;