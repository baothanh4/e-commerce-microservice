package com.example.userservice.controller;

import com.example.userservice.dto.OrderResponse;
import com.example.userservice.entity.Order;
import com.example.userservice.entity.OrderItem;
import com.example.userservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse placeOrder(@RequestBody Map<String, Object> body) {
        // Build Order entity from request body
        Order order = new Order();
        order.setId(body.get("id") != null ? body.get("id").toString() : null);
        order.setUserId(body.get("userId") != null ? Long.parseLong(body.get("userId").toString()) : null);
        order.setSubtotal(body.get("subtotal") != null ? Double.parseDouble(body.get("subtotal").toString()) : null);
        order.setTotal(body.get("total") != null ? Double.parseDouble(body.get("total").toString()) : null);
        order.setReceiverName(body.get("receiverName") != null ? body.get("receiverName").toString() : null);
        order.setPhoneNumber(body.get("phoneNumber") != null ? body.get("phoneNumber").toString() : null);
        order.setAddress(body.get("address") != null ? body.get("address").toString() : null);
        order.setPaymentMethod(body.get("paymentMethod") != null ? body.get("paymentMethod").toString() : null);
        order.setCardNumber(body.get("cardNumber") != null ? body.get("cardNumber").toString() : null);
        order.setCardName(body.get("cardName") != null ? body.get("cardName").toString() : null);
        order.setExpiryDate(body.get("expiryDate") != null ? body.get("expiryDate").toString() : null);
        order.setStatus(body.get("status") != null ? body.get("status").toString() : "PENDING");
        order.setCreatedAt(body.get("createdAt") != null ? body.get("createdAt").toString() : null);

        // Build OrderItem list from request body
        List<OrderItem> items = List.of();
        if (body.get("items") instanceof List<?> rawItems) {
            items = rawItems.stream()
                    .filter(i -> i instanceof Map)
                    .map(i -> {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> m = (Map<String, Object>) i;
                        return OrderItem.builder()
                                .productId(m.get("productId") != null ? Long.parseLong(m.get("productId").toString()) : null)
                                .productName(m.get("productName") != null ? m.get("productName").toString() : null)
                                .price(m.get("price") != null ? Double.parseDouble(m.get("price").toString()) : null)
                                .quantity(m.get("quantity") != null ? Integer.parseInt(m.get("quantity").toString()) : 1)
                                .selectedColor(m.get("selectedColor") != null ? m.get("selectedColor").toString() : null)
                                .selectedSize(m.get("selectedSize") != null ? m.get("selectedSize").toString() : null)
                                .image(m.get("image") != null ? m.get("image").toString() : null)
                                .sku(m.get("sku") != null ? m.get("sku").toString() : null)
                                .build();
                    })
                    .toList();
        }

        return orderService.save(order, items);
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponse> getOrdersByUser(@PathVariable Long userId) {
        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderDetails(@PathVariable String id) {
        return orderService.getOrderById(id);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateOrderStatus(@PathVariable String id, @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }
}
