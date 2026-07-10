package com.example.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "address_detail", nullable = false)
    private String addressDetail;

    @Column(name = "is_default")
    private Boolean isDefault;

    public Boolean isDefault() {
        return isDefault != null && isDefault;
    }

    public void setDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    private String label;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "province_code", nullable = false)
    private Province province;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ward_code", nullable = false)
    private Ward ward;
}
