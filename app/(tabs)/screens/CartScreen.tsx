import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';

type Service = {
  id: string;
  Creator: string;
  Price: number;
  ServiceName: string;
  Details?: string;  // Chi tiết cho dịch vụ
  Customizations?: string[];  // Tùy chọn cho dịch vụ
  Sizes?: string[];  // Tùy chọn kích thước
  imageUrl?: string;  // URL hình ảnh của dịch vụ
};

type CartProps = {
  isVisible: boolean;
  cartItems: Service[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
};

const Cart: React.FC<CartProps> = ({
  isVisible,
  cartItems,
  onClose,
  onRemove,
  onCheckout,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  const totalAmount = cartItems.reduce((total, item) => total + item.Price, 0);

  const handleSelectSize = (id: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.cartItem}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      )}
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName}>{item.ServiceName}</Text>
        {item.Details && <Text style={styles.itemDetails}>{item.Details}</Text>}
        {item.Customizations && item.Customizations.length > 0 && (
          <View style={styles.customizationsContainer}>
            <Text style={styles.customizationsTitle}>Tùy chọn:</Text>
            {item.Customizations.map((customization, index) => (
              <Text key={index} style={styles.customizationItem}>{customization}</Text>
            ))}
          </View>
        )}
        {item.Sizes && item.Sizes.length > 0 && (
          <View style={styles.sizeContainer}>
            {item.Sizes.map((size) => (
              <TouchableOpacity key={size} onPress={() => handleSelectSize(item.id, size)}>
                <Text style={selectedSizes[item.id] === size ? styles.selectedSize : styles.sizeItem}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {selectedSizes[item.id] && (
          <Text style={styles.selectedSizeText}>Đã chọn: {selectedSizes[item.id]}</Text>
        )}
      </View>
      <Text style={styles.itemPrice}>{item.Price} ₫</Text>
      <TouchableOpacity onPress={() => onRemove(item.id)}>
        <Text style={styles.removeButton}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal transparent={true} visible={isVisible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Giỏ hàng</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng: {totalAmount} ₫</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemImage: {
    width: 50, // Set width according to your design
    height: 50, // Set height according to your design
    marginRight: 10, // Space between image and text
  },
  itemDetailsContainer: {
    flex: 1, // Allows the details container to take remaining space
  },
  itemName: {
    fontSize: 16,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  customizationsContainer: {
    marginTop: 5,
  },
  customizationsTitle: {
    fontWeight: 'bold',
  },
  customizationItem: {
    fontSize: 14,
    color: '#555',
  },
  sizeContainer: {
    marginTop: 5,
  },
  sizeItem: {
    fontSize: 14,
    color: '#007BFF',
  },
  selectedSize: {
    fontSize: 14,
    color: '#E60026',
    fontWeight: 'bold',
  },
  selectedSizeText: {
    marginTop: 5,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#E60026',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default Cart;