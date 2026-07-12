package com.example.authservice.service;

import com.example.authservice.dto.response.AuthResponse;
import com.example.authservice.dto.request.LoginRequest;
import com.example.authservice.dto.request.RegisterRequest;
import com.example.authservice.entity.Gender;
import com.example.authservice.entity.Role;
import com.example.authservice.entity.User;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import com.example.authservice.dto.response.UserProfileDto;
import com.example.authservice.dto.response.AddressDto;
import com.example.authservice.dto.response.ProvinceDto;
import com.example.authservice.dto.response.WardDto;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.example.authservice.client.UserClient;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserClient userClient;

    @Transactional
    public String register(RegisterRequest request) {
        // Kiểm tra mật khẩu xác nhận
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Parse gender
        Gender gender = null;
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                gender = Gender.valueOf(request.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Giới tính không hợp lệ. Chọn: MALE, FEMALE, OTHER");
            }
        }

        // Parse date of birth
        LocalDate dob = null;
        if (request.getDob() != null && !request.getDob().isBlank()) {
            try {
                dob = LocalDate.parse(request.getDob());
            } catch (Exception e) {
                throw new RuntimeException("Ngày sinh không hợp lệ. Định dạng: yyyy-MM-dd");
            }
        }

        // Tạo user mới
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dob(dob)
                .gender(gender)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        // Gọi đồng bộ sang user-service qua Feign Client để tạo thông tin cá nhân
        java.util.List<AddressDto> addresses = null;
        if (request.getProvinceCode() != null && !request.getProvinceCode().isBlank()
                && request.getWardCode() != null && !request.getWardCode().isBlank()
                && request.getAddressDetail() != null && !request.getAddressDetail().isBlank()) {
            
            addresses = new java.util.ArrayList<>();
            AddressDto addressDto = AddressDto.builder()
                    .receiverName(request.getName())
                    .phoneNumber(request.getPhone())
                    .addressDetail(request.getAddressDetail())
                    .isDefault(true)
                    .label("HOME")
                    .province(ProvinceDto.builder().code(request.getProvinceCode()).build())
                    .ward(WardDto.builder().code(request.getWardCode()).build())
                    .build();
            addresses.add(addressDto);
        }

        UserProfileDto profileDto = UserProfileDto.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dob(request.getDob())
                .gender(request.getGender())
                .addresses(addresses)
                .build();
        userClient.createUser(profileDto);

        return "Đăng ký thành công!";
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            return AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new UsernameNotFoundException("Không tìm thấy thông tin tài khoản");
        }
        // Lấy thông tin cá nhân từ user-service
        return userClient.getProfileByEmail(email);
    }

    @Transactional
    public UserProfileDto updateProfile(String email, UserProfileDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy thông tin tài khoản"));

        // Cập nhật tên ở local DB
        user.setName(request.getName());
        userRepository.save(user);

        // Gọi sang user-service để cập nhật thông tin chi tiết và trả về kết quả mới nhất
        return userClient.updateProfileByEmail(email, request);
    }
}
