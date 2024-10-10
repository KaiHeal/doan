import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Cart from './CartScreen'; // Import component Cart

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  ImageUrl?: string;
  Description?: string; // Thêm trường mô tả
};

const DetailScreen = ({ route, navigation }: any) => {
  const { service } = route.params;
  const [cart, setCart] = useState<Service[]>([]);
  const [isCartVisible, setCartVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // Trạng thái để lưu kích thước đã chọn

  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']; // Danh sách kích thước

  useEffect(() => {
    const loadCart = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@cart');
        if (jsonValue != null) {
          setCart(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    const saveCart = async () => {
      try {
        const jsonValue = JSON.stringify(cart);
        await AsyncStorage.setItem('@cart', jsonValue);
      } catch (e) {
        console.error("Failed to save cart:", e);
      }
    };

    saveCart();
  }, [cart]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('Vui lòng chọn kích thước!');
      return;
    }

    const isAlreadyInCart = cart.some(item => item.id === service.id && item.Sizes?.includes(selectedSize!));
    
    if (isAlreadyInCart) {
      Alert.alert(`${service.ServiceName} với kích thước ${selectedSize} đã có trong giỏ hàng!`);
    } else {
      const itemToAdd = { ...service, Sizes: [selectedSize] }; // Thêm kích thước vào sản phẩm
      setCart(prevCart => [...prevCart, itemToAdd]);
      Alert.alert(`${service.ServiceName} kích thước ${selectedSize} đã được thêm vào giỏ hàng!`);
    }
  };

  const handleGoToCart = () => {
    setCartVisible(true);
  };

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    Alert.alert(`Sản phẩm đã được xóa khỏi giỏ hàng!`);
  };

  const handleCheckout = () => {
    Alert.alert('Thanh toán thành công!');
    setCart([]); // Giả định giỏ hàng được làm trống sau khi thanh toán
    setCartVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.cartIcon} onPress={handleGoToCart}>
        <Ionicons name="cart" size={24} color="black" />
        {cart.length > 0 && (
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cart.length}</Text>
          </View>
        )}
</TouchableOpacity>
      
      <Text style={styles.title}>{service.ServiceName}</Text>
      
      {service.ImageUrl && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service.ImageUrl }} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.text}>Giá: <Text style={styles.price}>{service.Price} ₫</Text></Text>
        <Text style={styles.text}>Người tạo: <Text style={styles.creator}>{service.Creator}</Text></Text>
        
        {/* Phần mô tả */}
        {service.Description && (
          <Text style={styles.description}>{service.Description}</Text>
        )}

        {/* Nút chọn kích thước */}
        <Text style={styles.text}>Chọn kích thước:</Text>
        <View style={styles.sizeContainer}>
          {sizes.map(size => (
            <TouchableOpacity
              key={size}
              style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={[styles.sizeButtonText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>

      <Cart
        isVisible={isCartVisible}
        cartItems={cart}
        onClose={() => setCartVisible(false)}
        onRemove={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  cartIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1000,
  },
  cartCount: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E60026',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333333',
  },
  price: {
    fontWeight: 'bold',
    color: '#F08080',
  },
  creator: {
    fontStyle: 'italic',
color: '#666666',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#E60026',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedSizeButton: {
    backgroundColor: '#E60026',
  },
  sizeButtonText: {
    color: '#E60026',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#E60026',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DetailScreen;