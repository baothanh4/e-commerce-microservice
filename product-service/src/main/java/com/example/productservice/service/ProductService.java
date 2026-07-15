package com.example.productservice.service;

import com.example.productservice.entity.Product;
import com.example.productservice.entity.ProductVariant;
import com.example.productservice.dto.ProductRequest;
import com.example.productservice.dto.ProductVariantRequest;
import com.example.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
    }

    public Product save(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .subCategory(request.getSubCategory())
                .stock(request.getStock())
                .price(request.getPrice())
                .image(request.getImage())
                .description(request.getDescription())
                .build();

        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vr.getSku())
                        .color(vr.getColor())
                        .size(vr.getSize())
                        .price(vr.getPrice())
                        .stock(vr.getStock())
                        .image(vr.getImage())
                        .build();
                product.getVariants().add(variant);
            }
        }
        return productRepository.save(product);
    }

    public Product update(Long id, ProductRequest request) {
        Product product = findById(id);
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setCategory(request.getCategory());
        product.setSubCategory(request.getSubCategory());
        product.setStock(request.getStock());
        product.setPrice(request.getPrice());
        product.setImage(request.getImage());
        product.setDescription(request.getDescription());

        product.getVariants().clear();
        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .sku(vr.getSku())
                        .color(vr.getColor())
                        .size(vr.getSize())
                        .price(vr.getPrice())
                        .stock(vr.getStock())
                        .image(vr.getImage())
                        .build();
                product.getVariants().add(variant);
            }
        }
        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = findById(id);
        productRepository.delete(product);
    }
}
