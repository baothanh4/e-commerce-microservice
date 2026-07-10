package com.example.authservice.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDto {
    private Long id;
    private Long userId;
    private String receiverName;
    private String phoneNumber;
    private String addressDetail;
    private Boolean isDefault;

    public Boolean isDefault() {
        return isDefault != null && isDefault;
    }

    public void setDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
    private String label;
    private ProvinceDto province;
    private WardDto ward;
}
