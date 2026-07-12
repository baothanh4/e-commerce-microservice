package com.example.authservice.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String dob; // yyyy-MM-dd
    private String gender; // MALE, FEMALE, OTHER
    private List<AddressDto> addresses;
}
