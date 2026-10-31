#!/usr/bin/env bash
# Sahne başına üretilmiş ses dosyalarını videoya yerleştirir. Proje kökünden çalıştırın:
#   bash <skill>/scripts/ses-ekle.sh <ad> <ses_dizini> [gecikme_ms=300]
# Girdi : cikti/<ad>.mp4, cikti/<ad>-zaman.json, <ses_dizini>/<sahne-id>.(mp3|wav|m4a)
# Çıktı : cikti/<ad>-sesli.mp4   (görüntü kopyalanır, ses AAC 192k)
set -euo pipefail
AD="${1:?ad gerekli (ör. masaustu)}"
SES="${2:?ses dizini gerekli}"
GEC="${3:-300}"
C="${CIKTI:-$PWD/cikti}"
Z="$C/$AD-zaman.json"
[[ -f "$C/$AD.mp4" && -f "$Z" ]] || { echo "yok: $C/$AD.mp4 ya da $Z"; exit 1; }

KES=$(jq -r '.ilkSahneMs // 0' "$Z")
GIRDI=(-i "$C/$AD.mp4")
FILTRE=""; ETIKET=""; n=0
while IFS=$'\t' read -r id bas; do
  dosya=""
  for uz in mp3 wav m4a; do [[ -f "$SES/$id.$uz" ]] && { dosya="$SES/$id.$uz"; break; }; done
  [[ -z "$dosya" ]] && { echo "sessiz: $id"; continue; }
  n=$((n + 1))
  ms=$(( bas - ${KES%.*} + GEC )); (( ms < 0 )) && ms=0
  GIRDI+=(-i "$dosya")
  FILTRE+="[$n:a]aresample=48000,adelay=${ms}|${ms}[a$n];"
  ETIKET+="[a$n]"
  printf '  %-12s %6.1f sn\n' "$id" "$(awk "BEGIN{print $ms/1000}")"
done < <(jq -r '.sahneler[] | [.id, .bas] | @tsv' "$Z")
(( n > 0 )) || { echo "hiç ses dosyası bulunamadı: $SES"; exit 1; }

ffmpeg -y -loglevel error "${GIRDI[@]}" -filter_complex \
  "${FILTRE}${ETIKET}amix=inputs=$n:duration=longest:normalize=0,apad[ses]" \
  -map 0:v -map "[ses]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$C/$AD-sesli.mp4"
echo "-> $C/$AD-sesli.mp4"
