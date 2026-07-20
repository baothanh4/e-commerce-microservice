package com.example.userservice.service;

import com.example.userservice.dto.OrderResponse;
import com.example.userservice.entity.Order;
import com.example.userservice.entity.OrderItem;
import com.example.userservice.repository.OrderItemRepository;
import com.example.userservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    // ─── Save ────────────────────────────────────────────────────────────────

    @Transactional
    public OrderResponse save(Order order, List<OrderItem> items) {
        if (order.getId() == null || order.getId().isEmpty()) {
            order.setId("LXC-" + System.currentTimeMillis() % 1000000);
        }
        Order saved = orderRepository.save(order);

        // Delete existing items for this order ID if updating to prevent duplicate rows
        if (items != null) {
            orderItemRepository.deleteByOrderId(saved.getId());
            for (OrderItem item : items) {
                item.setOrderId(saved.getId());
                item.setId(null);
            }
            orderItemRepository.saveAll(items);
        }
        List<OrderItem> savedItems = orderItemRepository.findByOrderId(saved.getId());
        return toDto(saved, savedItems);
    }

    // ─── Query ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(o -> toDto(o, orderItemRepository.findByOrderId(o.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + id));
        return toDto(order, orderItemRepository.findByOrderId(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(o -> toDto(o, orderItemRepository.findByOrderId(o.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse cancelOrder(String id, String reason) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + id));

        if ("COMPLETED".equals(order.getStatus())) {
            throw new IllegalStateException("Không thể hủy đơn hàng đã hoàn thành!");
        }

        order.setStatus("CANCELLED");
        order.setCancelReason(reason != null && !reason.isBlank() ? reason : "Khách hàng yêu cầu hủy đơn");
        order.setCancelledAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")));
        Order saved = orderRepository.save(order);
        return toDto(saved, orderItemRepository.findByOrderId(id));
    }

    @Transactional
    public OrderResponse updateStatus(String id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại: " + id));
        order.setStatus(status);
        if ("CANCELLED".equals(status) && (order.getCancelReason() == null || order.getCancelReason().isBlank())) {
            order.setCancelReason("Đã hủy bởi Quản trị viên");
            order.setCancelledAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")));
        }
        Order saved = orderRepository.save(order);
        return toDto(saved, orderItemRepository.findByOrderId(id));
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private OrderResponse toDto(Order order, List<OrderItem> items) {
        List<OrderResponse.OrderItemResponse> itemDtos = items == null ? List.of() :
                items.stream().map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .selectedColor(item.getSelectedColor())
                        .selectedSize(item.getSelectedSize())
                        .image(item.getImage())
                        .sku(item.getSku())
                        .build()
                ).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .subtotal(order.getSubtotal())
                .total(order.getTotal())
                .receiverName(order.getReceiverName())
                .phoneNumber(order.getPhoneNumber())
                .address(order.getAddress())
                .paymentMethod(order.getPaymentMethod())
                .cardNumber(order.getCardNumber())
                .cardName(order.getCardName())
                .expiryDate(order.getExpiryDate())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .cancelReason(order.getCancelReason())
                .cancelledAt(order.getCancelledAt())
                .items(itemDtos)
                .build();
    }
}
