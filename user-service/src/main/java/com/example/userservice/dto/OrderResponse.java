package com.example.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private Long userId;
    private Double subtotal;
    private Double total;
    private String receiverName;
    private String phoneNumber;
    private String address;
    private String paymentMethod;
    private String cardNumber;
    private String cardName;
    private String expiryDate;
    private String status;
    private String createdAt;
    private String cancelReason;
    private String cancelledAt;
    private List<OrderItemResponse> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private String selectedColor;
        private String selectedSize;
        private String image;
        private String sku;
    }
}
